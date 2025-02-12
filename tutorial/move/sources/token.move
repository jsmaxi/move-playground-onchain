module token_addr::basic_token {
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::account;

    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;

    struct TokenInfo has key {
        total_supply: u64,
        mint_events: event::EventHandle<MintEvent>,
        burn_events: event::EventHandle<BurnEvent>,
    }

    struct Balance has key {
        value: u64
    }

    struct MintEvent has drop, store {
        amount: u64,
        recipient: address,
    }

    struct BurnEvent has drop, store {
        amount: u64,
        burner: address,
    }

    public fun initialize(account: &signer) {
        move_to(account, TokenInfo {
            total_supply: 0,
            mint_events: account::new_event_handle<MintEvent>(account),
            burn_events: account::new_event_handle<BurnEvent>(account),
        });

        move_to(account, Balance { value: 0 });
    }

    public entry fun initialize_balance(account: &signer) {
        let account_addr = signer::address_of(account);
        if (!exists<Balance>(account_addr)) {
            move_to(account, Balance { value: 0 });
        }
    }

    public entry fun mint(
        admin: &signer, 
        amount: u64, 
        recipient: address
    ) acquires TokenInfo, Balance {
        let admin_addr = signer::address_of(admin);
        
        assert!(exists<Balance>(recipient), E_NOT_AUTHORIZED);
        
        let token_info = borrow_global_mut<TokenInfo>(admin_addr);
        token_info.total_supply = token_info.total_supply + amount;
        
        let recipient_balance = borrow_global_mut<Balance>(recipient);
        recipient_balance.value = recipient_balance.value + amount;
        
        event::emit_event(&mut token_info.mint_events, MintEvent {
            amount,
            recipient,
        });
    }

    public entry fun burn(
        account: &signer, 
        amount: u64
    ) acquires TokenInfo, Balance {
        let account_addr = signer::address_of(account);
        
        let balance = borrow_global_mut<Balance>(account_addr);
        assert!(balance.value >= amount, E_INSUFFICIENT_BALANCE);
        
        balance.value = balance.value - amount;
        
        let token_info = borrow_global_mut<TokenInfo>(account_addr);
        token_info.total_supply = token_info.total_supply - amount;
        
        event::emit_event(&mut token_info.burn_events, BurnEvent {
            amount,
            burner: account_addr,
        });
    }

    public fun get_balance(account_addr: address): u64 acquires Balance {
        borrow_global<Balance>(account_addr).value
    }

    public fun get_total_supply(token_addr: address): u64 acquires TokenInfo {
        borrow_global<TokenInfo>(token_addr).total_supply
    }
}