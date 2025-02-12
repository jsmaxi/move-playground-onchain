module voting_addr::voting {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    const E_NOT_AUTHORIZED: u64 = 1;
    const E_PROPOSAL_NOT_FOUND: u64 = 2;
    const E_VOTING_PERIOD_ENDED: u64 = 3;
    const E_ALREADY_VOTED: u64 = 4;
    const E_VOTING_PERIOD_NOT_ENDED: u64 = 5;
    const E_PROPOSAL_ALREADY_EXECUTED: u64 = 6;
    const E_INSUFFICIENT_VOTING_POWER: u64 = 7;
    const E_INVALID_QUORUM: u64 = 8;
    const E_VOTER_ALREADY_INITIALIZED: u64 = 9;

    const STATUS_ACTIVE: u8 = 0;
    const STATUS_PASSED: u8 = 1;
    const STATUS_FAILED: u8 = 2;
    const STATUS_EXECUTED: u8 = 3;

    const MINIMUM_VOTING_PERIOD: u64 = 86400; // 1 day in seconds
    const QUORUM_PERCENTAGE: u64 = 51; // 51% required for proposal to pass

    struct VotingConfig has key {
        admin: address,
        proposal_count: u64,
        min_voting_power: u64,
        proposals: vector<Proposal>,
        create_proposal_events: event::EventHandle<CreateProposalEvent>,
        vote_events: event::EventHandle<VoteEvent>,
        execute_events: event::EventHandle<ExecuteEvent>,
    }

    struct Proposal has store {
        id: u64,
        creator: address,
        description: String,
        start_time: u64,
        end_time: u64,
        yes_votes: u64,
        no_votes: u64,
        status: u8,
        total_voting_power: u64,
        executed: bool,
    }

    struct UserVotes has key {
        votes: vector<u64>, // Stores proposal IDs user has voted on
        voting_power: u64,
    }

    struct CreateProposalEvent has drop, store {
        proposal_id: u64,
        creator: address,
        description: String,
        start_time: u64,
        end_time: u64,
    }

    struct VoteEvent has drop, store {
        proposal_id: u64,
        voter: address,
        vote: bool,
        voting_power: u64,
        time: u64,
    }

    struct ExecuteEvent has drop, store {
        proposal_id: u64,
        executor: address,
        time: u64,
        result: bool,
    }

    public entry fun initialize(
        admin: &signer,
        min_voting_power: u64,
    ) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, VotingConfig {
            admin: admin_addr,
            proposal_count: 0,
            min_voting_power: min_voting_power,
            proposals: vector::empty(),
            create_proposal_events: account::new_event_handle<CreateProposalEvent>(admin),
            vote_events: account::new_event_handle<VoteEvent>(admin),
            execute_events: account::new_event_handle<ExecuteEvent>(admin),
        });
    }

    public entry fun initialize_voter(
        voter: &signer,
        voting_power: u64
    ) {
        let voter_addr = signer::address_of(voter);
        
        assert!(!exists<UserVotes>(voter_addr), E_VOTER_ALREADY_INITIALIZED);
        
        move_to(voter, UserVotes {
            votes: vector::empty(),
            voting_power,
        });
    }

    public entry fun update_voting_power(
        admin: &signer,
        voter: address,
        new_voting_power: u64
    ) acquires VotingConfig, UserVotes {
        let admin_addr = signer::address_of(admin);
        let config = borrow_global<VotingConfig>(@voting_addr);
        assert!(admin_addr == config.admin, E_NOT_AUTHORIZED);
        
        let voter_info = borrow_global_mut<UserVotes>(voter);
        voter_info.voting_power = new_voting_power;
    }

    public entry fun create_proposal(
        creator: &signer,
        description: String,
        voting_period: u64,
    ) acquires VotingConfig, UserVotes {
        let creator_addr = signer::address_of(creator);
        let config = borrow_global_mut<VotingConfig>(@voting_addr);
        
        let voter_info = borrow_global<UserVotes>(creator_addr);
        assert!(voter_info.voting_power >= config.min_voting_power, E_INSUFFICIENT_VOTING_POWER);
        
        assert!(voting_period >= MINIMUM_VOTING_PERIOD, E_INVALID_QUORUM);
        
        let start_time = timestamp::now_seconds();
        let proposal = Proposal {
            id: config.proposal_count,
            creator: creator_addr,
            description,
            start_time,
            end_time: start_time + voting_period,
            yes_votes: 0,
            no_votes: 0,
            status: STATUS_ACTIVE,
            total_voting_power: 0,
            executed: false,
        };
        
        vector::push_back(&mut config.proposals, proposal);
        config.proposal_count = config.proposal_count + 1;
        
        event::emit_event(&mut config.create_proposal_events, CreateProposalEvent {
            proposal_id: config.proposal_count - 1,
            creator: creator_addr,
            description,
            start_time,
            end_time: start_time + voting_period,
        });
    }

    public entry fun vote(
        voter: &signer,
        proposal_id: u64,
        vote: bool
    ) acquires VotingConfig, UserVotes {
        let voter_addr = signer::address_of(voter);
        let config = borrow_global_mut<VotingConfig>(@voting_addr);
        
        assert!(proposal_id < config.proposal_count, E_PROPOSAL_NOT_FOUND);
        let proposal = vector::borrow_mut(&mut config.proposals, proposal_id);
        
        let current_time = timestamp::now_seconds();
        assert!(current_time <= proposal.end_time, E_VOTING_PERIOD_ENDED);
        assert!(proposal.status == STATUS_ACTIVE, E_VOTING_PERIOD_ENDED);
        
        let user_votes = borrow_global_mut<UserVotes>(voter_addr);
        assert!(!vector::contains(&user_votes.votes, &proposal_id), E_ALREADY_VOTED);
        
        vector::push_back(&mut user_votes.votes, proposal_id);
        
        if (vote) {
            proposal.yes_votes = proposal.yes_votes + user_votes.voting_power;
        } else {
            proposal.no_votes = proposal.no_votes + user_votes.voting_power;
        };
        proposal.total_voting_power = proposal.total_voting_power + user_votes.voting_power;
        
        event::emit_event(&mut config.vote_events, VoteEvent {
            proposal_id,
            voter: voter_addr,
            vote,
            voting_power: user_votes.voting_power,
            time: current_time,
        });
    }

    public entry fun execute_proposal(
        executor: &signer,
        proposal_id: u64
    ) acquires VotingConfig {
        let config = borrow_global_mut<VotingConfig>(@voting_addr);
        
        assert!(proposal_id < config.proposal_count, E_PROPOSAL_NOT_FOUND);
        let proposal = vector::borrow_mut(&mut config.proposals, proposal_id);
        
        let current_time = timestamp::now_seconds();
        assert!(current_time > proposal.end_time, E_VOTING_PERIOD_NOT_ENDED);
        assert!(!proposal.executed, E_PROPOSAL_ALREADY_EXECUTED);
        
        let total_votes = proposal.yes_votes + proposal.no_votes;
        let yes_percentage = if (total_votes == 0) { 0 }
            else { (proposal.yes_votes * 100) / total_votes };
        
        let passed = yes_percentage >= QUORUM_PERCENTAGE;
        proposal.status = if (passed) { STATUS_PASSED } else { STATUS_FAILED };
        proposal.executed = true;
        
        event::emit_event(&mut config.execute_events, ExecuteEvent {
            proposal_id,
            executor: signer::address_of(executor),
            time: current_time,
            result: passed,
        });
    }

    public fun get_proposal(
        proposal_id: u64
    ): (String, u64, u64, u64, u64, u8, bool) acquires VotingConfig {
        let config = borrow_global<VotingConfig>(@voting_addr);
        assert!(proposal_id < config.proposal_count, E_PROPOSAL_NOT_FOUND);
        
        let proposal = vector::borrow(&config.proposals, proposal_id);
        (
            proposal.description,
            proposal.start_time,
            proposal.end_time,
            proposal.yes_votes,
            proposal.no_votes,
            proposal.status,
            proposal.executed
        )
    }

    public fun get_voting_power(addr: address): u64 acquires UserVotes {
        borrow_global<UserVotes>(addr).voting_power
    }

    public fun get_proposal_count(): u64 acquires VotingConfig {
        borrow_global<VotingConfig>(@voting_addr).proposal_count
    }

    public fun has_voted(addr: address, proposal_id: u64): bool acquires UserVotes {
        let user_votes = borrow_global<UserVotes>(addr);
        vector::contains(&user_votes.votes, &proposal_id)
    }
}