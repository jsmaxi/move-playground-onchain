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

# install movement cli: https://docs.movementnetwork.xyz/devs/movementcli
echo "Installing Movement CLI..."
git clone https://github.com/movementlabsxyz/aptos-core/ && cd aptos-core
cargo build -p movement
cp target/debug/movement /usr/local/bin/
movement --help

echo "Installation done"
