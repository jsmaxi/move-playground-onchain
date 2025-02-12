module counter_addr::counter {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::event;

    const E_NOT_INITIALIZED: u64 = 1;
    const E_COUNTER_EXISTS: u64 = 2;

    struct Counter has key {
        value: u64,
        increment_events: event::EventHandle<IncrementEvent>,
    }

    struct IncrementEvent has drop, store {
        from_value: u64,
        to_value: u64,
    }

    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<Counter>(addr), E_COUNTER_EXISTS);
        
        let counter = Counter {
            value: 0,
            increment_events: account::new_event_handle<IncrementEvent>(account),
        };
        
        move_to(account, counter);
    }

    public entry fun increment(account: &signer) acquires Counter {
        let addr = signer::address_of(account);
        assert!(exists<Counter>(addr), E_NOT_INITIALIZED);
        
        let counter = borrow_global_mut<Counter>(addr);
        let old_value = counter.value;
        counter.value = counter.value + 1;

        event::emit_event(&mut counter.increment_events, IncrementEvent {
            from_value: old_value,
            to_value: counter.value,
        });
    }

    public fun get_value(addr: address): u64 acquires Counter {
        assert!(exists<Counter>(addr), E_NOT_INITIALIZED);
        borrow_global<Counter>(addr).value
    }
}