# GitHub Actions Workflows

This directory contains CI/CD workflows for the Network application.

## Workflows

### CI (`ci.yml`)

Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**

- **Lint**: Runs ESLint and Prettier checks
- **Test**: Runs all tests with Jest
- **Build**: Builds all projects to verify they compile

**Triggers:**

- Push to `main` or `develop`
- Pull requests to `main` or `develop`

### Deploy to EC2 (`deploy-ec2.yml`)

Deploys the application to an EC2 instance using Docker Compose.

**Jobs:**

- **Detect changes**: On push, determines which paths changed; on manual run, uses the backend/frontend checkboxes.
- **Deploy Backend**: Runs only when backend-related files changed (or when "Deploy backend" is checked manually). Builds Docker image, transfers to EC2, runs deployment script.
- **Deploy Frontend**: Runs only when frontend-related files changed (or when "Deploy frontend" is checked manually). Builds frontend, transfers to EC2, restarts proxy.

**Path-based deploy (push to `main`):**

- Backend deploy runs when changes touch: `apps/api/**`, `docker-compose.prod.yml`, or backend deploy scripts under `scripts/remote/` (e.g. `deploy-backend.sh`, `download-backend.sh`, `verify-backend.sh`, `setup-shared-proxy.sh`).
- Frontend deploy runs when changes touch: `apps/web/**`, `Caddyfile`, `Caddyfile.shared`, or frontend deploy scripts (`deploy-frontend.sh`, `deploy-shared-caddyfile.sh`).

**Triggers:**

- Push to `main` branch (only the app(s) with changed paths are deployed)
- Manual workflow dispatch (with options to deploy backend/frontend separately)

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### EC2 Deployment Secrets (SSM-based)

**Required:**
- **`EC2_INSTANCE_ID`**: EC2 instance ID
  - Example: `i-0123456789abcdef0`
- **`S3_DEPLOY_BUCKET`**: S3 bucket name for deployment artifacts
  - Example: `my-network-deployments`
  - Must be in the same region as your EC2 instance

**AWS Authentication (choose one option):**

**Option A: OIDC (Recommended - More Secure)**
- **`AWS_ROLE_ARN`**: IAM Role ARN for GitHub Actions OIDC
  - Example: `arn:aws:iam::123456789012:role/github-actions-role`
  - This role must have permissions for SSM, S3, and EC2
  - See "Setting Up OIDC" section below

**Option B: Access Keys (Simpler Setup)**
- **`AWS_ACCESS_KEY_ID`**: AWS access key ID
- **`AWS_SECRET_ACCESS_KEY`**: AWS secret access key
  - User/role must have permissions for SSM, S3, and EC2

**Optional:**
- **`AWS_REGION`**: AWS region (defaults to `us-east-1` if not set)
  - Example: `us-east-1`
- **`VITE_API`**: API endpoint URL for frontend builds
  - Example: `https://backintouch.net/api`

## Setting Up AWS SSM Access

### 1. Enable SSM on EC2 Instance

The EC2 instance must have the SSM Agent installed and an IAM instance profile with SSM permissions.

**For Ubuntu/Debian:**
```bash
sudo snap install amazon-ssm-agent --classic
sudo systemctl enable amazon-ssm-agent
sudo systemctl start amazon-ssm-agent
```

**For Amazon Linux 2:**
```bash
sudo systemctl enable amazon-ssm-agent
sudo systemctl start amazon-ssm-agent
```

### 2. Create IAM Instance Profile

Create an IAM role with the `AmazonSSMManagedInstanceCore` policy and attach it to your EC2 instance:

1. Go to IAM → Roles → Create role
2. Select "EC2" as the trusted entity
3. Attach policy: `AmazonSSMManagedInstanceCore`
4. Add additional policies for S3 access:
   - `AmazonS3ReadOnlyAccess` (or create custom policy for your deployment bucket)
5. Create role and attach to EC2 instance

### 3. Configure GitHub Actions Authentication

**Option A: OIDC (Recommended)**

1. Go to IAM → Identity providers → Add provider
2. Choose "OpenID Connect"
3. Provider URL: `https://token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Go to IAM → Roles → Create role
6. Select "Web identity" as trusted entity
7. Choose the GitHub provider you just created
8. Enter your GitHub organization/repository
9. Attach policies:
   - `AmazonSSMFullAccess` (or custom policy for SSM commands)
   - `AmazonS3FullAccess` (or custom policy for deployment bucket)
   - `AmazonEC2ReadOnlyAccess` (for instance status checks)
10. Copy the Role ARN and add to GitHub Secrets as `AWS_ROLE_ARN`

**Option B: Access Keys (Simpler)**

1. Go to IAM → Users → Create user (or use existing)
2. Attach policies:
   - `AmazonSSMFullAccess` (or custom policy for SSM commands)
   - `AmazonS3FullAccess` (or custom policy for deployment bucket)
   - `AmazonEC2ReadOnlyAccess` (for instance status checks)
3. Go to Security credentials → Create access key
4. Add to GitHub Secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

### 4. Create S3 Bucket for Deployments

```bash
aws s3 mb s3://your-network-deployments --region us-east-1
```

Add bucket policy to allow GitHub Actions role and EC2 instance role to access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "arn:aws:iam::YOUR_ACCOUNT:role/github-actions-role",
          "arn:aws:iam::YOUR_ACCOUNT:role/ec2-ssm-role"
        ]
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::your-network-deployments/*"
    }
  ]
}
```

### 5. Verify SSM Access

Test SSM connection from your local machine:

```bash
aws ssm send-command \
  --instance-ids i-YOUR_INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=['echo Hello from SSM']" \
  --region us-east-1
```

### 6. Add Secrets to GitHub

Go to: Settings → Secrets and variables → Actions → New repository secret

Add:
- `AWS_ROLE_ARN`: Your IAM role ARN
- `AWS_REGION`: Your AWS region (optional)
- `EC2_INSTANCE_ID`: Your EC2 instance ID
- `S3_DEPLOY_BUCKET`: Your S3 bucket name

## Workflow Customization

### Skipping Deployment

You can skip deployment by including `[skip deploy]` in your commit message:

```bash
git commit -m "Update docs [skip deploy]"
```

Add this to the workflow:

```yaml
if: "!contains(github.event.head_commit.message, '[skip deploy]')"
```

### Manual Deployment

You can manually trigger deployment from the Actions tab:

1. Go to Actions → Deploy to EC2
2. Click **"Run workflow"** (dropdown), choose branch (e.g. `main`), check **Deploy backend** and/or **Deploy frontend**
3. Click the green **"Run workflow"** button

**To run a job that was skipped:** Push-triggered runs only deploy apps whose files changed. GitHub does not let you "Re-run" a single skipped job. To run a deploy that was skipped (e.g. only backend was deployed and you want to deploy frontend too), start a **new** run via **"Run workflow"** and check only the app(s) you want. Do not use "Re-run all jobs" on the previous run—that reuses the same push event and path detection, so the same jobs will be skipped again.

### Environment-Specific Deployments

To add staging/production environments, create separate workflow files:

- `.github/workflows/deploy-ec2-staging.yml`
- `.github/workflows/deploy-ec2-production.yml`

Or use GitHub Environments with protection rules.

## Troubleshooting

### Build Failures

- Check Node.js version matches local (currently 22)
- Verify all dependencies are in `package.json`
- Check Nx cache issues (try `nx reset`)

### Deployment Failures

**SSM Connection Issues:**

- Verify `EC2_INSTANCE_ID` is correct
- Check EC2 instance has SSM Agent installed and running
- Ensure EC2 instance has IAM role with `AmazonSSMManagedInstanceCore` policy
- Verify `AWS_ROLE_ARN` has SSM permissions
- Test SSM connection: `aws ssm send-command --instance-ids i-XXX --document-name "AWS-RunShellScript" --parameters "commands=['echo test']"`

**S3 Access Issues:**

- Verify `S3_DEPLOY_BUCKET` exists and is accessible
- Check IAM roles (GitHub Actions and EC2) have S3 permissions
- Verify bucket policy allows access from both roles
- Test S3 access: `aws s3 ls s3://your-bucket-name/`

**EC2 Deployment Issues:**

- Check EC2 instance is running
- Verify Docker is installed on EC2
- Check deployment script exists: `/opt/network/scripts/deploy-ec2.sh`
- View SSM command output in AWS Console → Systems Manager → Run Command
- View logs on EC2 via SSM: `aws ssm send-command --instance-ids i-XXX --document-name "AWS-RunShellScript" --parameters "commands=['docker compose -f /opt/network/docker-compose.prod.yml logs']"`

**Health Check Failures:**

- Verify API is running: `curl http://localhost:3000/health` on EC2
- Check API logs for errors
- Verify environment variables are set correctly

**Frontend Deployment Issues:**

- Verify frontend directory exists: `/opt/network/frontend`
- Check file permissions
- Verify Caddyfile is configured correctly

## Security Notes

- Never commit secrets to the repository
- Use AWS SSM instead of SSH (no keys to manage)
- Use IAM roles with least-privilege policies
- Rotate IAM role credentials regularly
- Use OIDC for GitHub Actions (no long-lived credentials)
- Use least-privilege security groups on EC2
- Enable branch protection on `main`
- Require pull request reviews before merging
- Keep EC2 instance updated with security patches
- Use S3 bucket policies to restrict access

## Deployment Flow

1. **CI runs** (lint, test, build)
2. **CD triggers** on push to `main`
3. **Backend job**:
   - Builds Docker image
   - Uploads to S3
   - Downloads on EC2 via SSM
   - Loads image on EC2
   - Runs deployment script via SSM
   - Verifies health via SSM
4. **Frontend job**:
   - Builds production frontend
   - Uploads to S3
   - Downloads on EC2 via SSM
   - Restarts proxy via SSM

## Resources

- [EC2 Deployment Guide](../docs/deployment-ec2.md)
- [EC2 Quick Start](../docs/EC2_DEPLOYMENT_QUICKSTART.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
