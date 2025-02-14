# Update the package list
echo "Updating package list..."
apt-get update

# Install Git
echo "Installing Git..."
apt-get install -y git

# Install curl (required for Rust installation)
echo "Installing curl..."
apt-get install -y curl

# Install Rust using rustup (which includes cargo)
echo "Installing Rust and Cargo..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Add Cargo to the current shell session
source $HOME/.cargo/env

# Verify installations
echo "Verifying installations..."
git --version
cargo --version

# # Install build tools for movement cli
# echo "Installing build tools..."
# apt-get install -y lld clang build-essential
# apt-get install -y libdw-dev
# apt-get install -y pkg-config libssl-dev

# # Install movement cli: https://docs.movementnetwork.xyz/devs/movementcli
# echo "Installing Movement CLI..."
# git clone https://github.com/movementlabsxyz/aptos-core/ && cd aptos-core
# cargo build -p movement
# cp target/debug/movement /usr/local/bin/
# movement --help

echo "Install build tools..."
apt-get install -y libdw-dev
apt-get install -y pkg-config 
apt-get install -y libssl-dev
apt-get install -y build-essential
apt-get install -y llvm
apt-get install -y clang
apt-get install -y lld
apt-get install -y libudev-dev

echo "Set up aptos cli..."
git clone https://github.com/aptos-labs/aptos-core.git
cd aptos-core
git checkout -f -b aptos-cli-v3.4.1  --track origin/devnet # version <= 3.5 for movement
git status
./scripts/dev_setup.sh -ypt
source ~/.profile
source ~/.cargo/env
# cargo build
cargo build --package aptos --profile cli
cp target/cli/aptos /usr/local/bin/
aptos --help

# Install movement cli: https://docs.movementnetwork.xyz/devs/movementcli
# echo "Installing Movement CLI..."
# git clone https://github.com/jsmaxi/aptos-core && cd aptos-core
# cargo build -p movement
# cp target/debug/movement /usr/local/bin/
# movement --help
echo "Done with cli"

echo "Installation done"
