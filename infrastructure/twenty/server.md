# Twenty CRM Server

## Server Details

| Property     | Value              |
|--------------|--------------------|
| Name         | twenty-crm         |
| Server ID    | 122217874          |
| Type         | cpx22 (3 vCPU AMD, 4GB RAM, 80GB NVMe) |
| Image        | ubuntu-24.04       |
| Location     | nbg1-dc3 (Nuremberg, Germany) |
| IPv4         | 91.98.168.21       |
| IPv6         | 2a01:4f8:1c19:2094::/64 |
| Cost         | ~EUR 4.85/mo       |
| Provisioned  | 2026-02-26         |

## Firewall

| Firewall ID  | Name                 |
|--------------|----------------------|
| 10600701     | twenty-crm-firewall  |

### Rules
| Direction | Protocol | Port | Source/Dest         |
|-----------|----------|------|---------------------|
| Inbound   | TCP      | 22   | 0.0.0.0/0, ::/0    |
| Inbound   | TCP      | 80   | 0.0.0.0/0, ::/0    |
| Inbound   | TCP      | 443  | 0.0.0.0/0, ::/0    |
| Outbound  | TCP      | any  | 0.0.0.0/0, ::/0    |
| Outbound  | UDP      | any  | 0.0.0.0/0, ::/0    |
| Outbound  | ICMP     | -    | 0.0.0.0/0, ::/0    |

## SSH Access

```bash
ssh root@91.98.168.21
# SSH key: id 106009159 (ed25519)
```

## Next Steps

1. **ROOSE-265**: Deploy Twenty CRM via Docker Compose
2. **ROOSE-292**: Deploy Fastify API Gateway
3. **ROOSE-324**: Configure Caddy reverse proxy + SSL (Let's Encrypt)
4. Configure DNS records pointing to 91.98.168.21
