# install movement cli: https://docs.movementnetwork.xyz/devs/movementcli
git clone https://github.com/movementlabsxyz/aptos-core/ && cd aptos-core
cargo build -p movement
sudo cp target/debug/movement /usr/local/bin/
movement --help
