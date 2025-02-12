module bio_addr::onchain_bio {
  use std::string::{String};
  use std::signer;

  struct Bio has key, store, drop {
      name: String,
      bio: String,
  }
  
  #[view]
  public fun signature() : address {
      @0xba036648a53de7a993c3ea627453c43fa8f8b41acda5896b51c263a3d0d5f420 // Replace with yours
  }

  public entry fun register(account: &signer, name: String, bio: String) acquires Bio {
    if (exists<Bio>(signer::address_of(account))) {
      let _old_Bio = move_from<Bio>(signer::address_of(account));
    };
    let bio = Bio {
      name,
      bio,
    };
    move_to<Bio>(account, bio);
  }
}