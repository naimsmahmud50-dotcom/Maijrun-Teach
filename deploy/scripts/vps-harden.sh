#!/usr/bin/env bash
# ==============================================================================
# MAIJRUN Tech — Ubuntu/Debian Production VPS Hardening Script
# Target: Ubuntu 22.04 / 24.04 LTS
# Guidelines: CIS Benchmark / OWASP Infrastructure Hardening Baseline
# ==============================================================================

set -euo pipefail

echo "=================================================="
echo "🛡️  MAIJRUN Tech: Starting VPS Production Hardening"
echo "=================================================="

# Ensure running as root
if [ "$(id -u)" -ne 0 ]; then
  echo "❌ This script must be run as root (or via sudo). Exiting."
  exit 1
fi

DEPLOY_USER="deployer"
SSH_PORT="2222"

# 1. Update and Upgrade System Packages
echo "📦 1. Updating and patching system packages..."
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  ufw \
  fail2ban \
  unattended-upgrades \
  apt-listchanges \
  curl \
  wget \
  git \
  gnupg \
  ca-certificates \
  htop \
  net-tools

# 2. Create Non-Root Deployer User with Sudo
if ! id "$DEPLOY_USER" &>/dev/null; then
  echo "👤 2. Creating dedicated deployer user: $DEPLOY_USER..."
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
  usermod -aG sudo "$DEPLOY_USER"
  echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/$DEPLOY_USER"
  chmod 0440 "/etc/sudoers.d/$DEPLOY_USER"

  # Setup SSH authorized_keys if root has one
  if [ -f /root/.ssh/authorized_keys ]; then
    mkdir -p "/home/$DEPLOY_USER/.ssh"
    cp /root/.ssh/authorized_keys "/home/$DEPLOY_USER/.ssh/"
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
    chmod 700 "/home/$DEPLOY_USER/.ssh"
    chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"
  fi
else
  echo "👤 Deployer user '$DEPLOY_USER' already exists."
fi

# 3. Harden OpenSSH Configuration
echo "🔒 3. Hardening SSH Configuration..."
SSHD_CONFIG="/etc/ssh/sshd_config"
SSHD_HARDENED="/etc/ssh/sshd_config.d/99-maijrun-hardening.conf"
mkdir -p /etc/ssh/sshd_config.d/

cat <<EOF > "$SSHD_HARDENED"
# MAIJRUN Tech SSH Hardening Configuration
Port $SSH_PORT
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
PermitEmptyPasswords no
MaxAuthTries 4
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
EOF

# Validate SSH config before restarting
if sshd -t; then
  systemctl restart ssh || systemctl restart sshd
  echo "✅ SSH daemon updated: Listening on port $SSH_PORT (Root login & password auth DISABLED)."
else
  echo "⚠️ SSH config test failed. Reverting custom conf."
  rm -f "$SSHD_HARDENED"
fi

# 4. Configure UFW Firewall (Deny all incoming, allow only 80, 443, and hardened SSH)
echo "🧱 4. Configuring UFW Firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow "$SSH_PORT"/tcp comment "Hardened SSH port"
ufw allow 80/tcp comment "HTTP (Nginx reverse proxy)"
ufw allow 443/tcp comment "HTTPS (Nginx SSL)"
# Internal DB and Redis ports are NOT exposed to public
ufw --force enable
echo "✅ UFW active: Only ports $SSH_PORT, 80, 443 allowed."

# 5. Configure Fail2ban Intrusion Prevention
echo "🛑 5. Configuring Fail2ban..."
cat <<EOF > /etc/fail2ban/jail.local
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port    = $SSH_PORT
mode    = aggressive

[nginx-http-auth]
enabled = true
port    = http,https

[nginx-botsearch]
enabled = true
port    = http,https
EOF

systemctl enable fail2ban
systemctl restart fail2ban
echo "✅ Fail2ban active and watching SSH ($SSH_PORT) and Nginx."

# 6. Enable Automatic Unattended Security Updates
echo "🔄 6. Enabling automatic security updates..."
cat <<EOF > /etc/apt/apt.conf.d/20auto-upgrades
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
systemctl restart unattended-upgrades
echo "✅ Unattended security updates configured."

echo "=================================================="
echo "🎉 VPS Hardening Complete!"
echo "👉 Remember to connect with: ssh -p $SSH_PORT $DEPLOY_USER@<YOUR_VPS_IP>"
echo "=================================================="
