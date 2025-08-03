# 🔍 Selenium UI Test Boilerplate

A comprehensive and maintainable Selenium WebDriver test framework with built-in logging, screenshot capabilities, and CI/CD integration. Perfect for getting started with UI automation testing or as a foundation for larger test suites.

## 🔧 Features

- ✅ **Cross-browser support** (Chrome, Firefox)
- 📝 **Comprehensive logging** with Winston
- 📸 **Automatic screenshots** on test failures
- 🎯 **Headless and headed modes**
- 🛡️ **Security-focused** configuration
- 📊 **Test reporting** with JUnit XML output
- 🚀 **Quick setup** - clone and run in 2 minutes
- 🔧 **Enhanced error handling** and retry logic
- 🏗️ **Improved CI stability** with better browser setup
- 🧪 **BaseTest class** for consistent test structure
- 📋 **Page ready detection** and navigation retry logic

## 🎯 DEMO MODE - Quick Test Without Browser Dependencies

This demo shows the project structure and logging capabilities without requiring browser setup.

### Run Demo

```bash
npm run demo
```

This will:

- ✅ Show project structure
- 📝 Display logging capabilities  
- 🧪 Demonstrate test organization
- 📊 Generate sample outputs

For full browser testing, ensure Chrome/Firefox are installed and drivers are compatible.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Chrome or Firefox browser installed

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/selenium-ui-test-boilerplate.git
cd selenium-ui-test-boilerplate

# Install dependencies
npm install

# Create required directories
mkdir -p screenshots logs test-results

# Run tests
npm test
```

### Running Tests

```bash
# Run all tests (default: Chrome, headed mode)
npm test

# Run in headless mode
npm run test:headless

# Run with specific browser
npm run test:chrome
npm run test:firefox

# Clean up artifacts
npm run clean
```

## 🧪 Example Output

The tests will automatically:

- 📋 Log each test step with timestamps
- 📸 Capture screenshots on failures
- 💾 Save detailed logs to `logs/` directory
- 📊 Generate test reports

``` bash
2024-01-15 10:30:15 [info]: 🧪 Test Started: should load login page successfully
2024-01-15 10:30:16 [info]: 📋 Step: Navigate to demo login page
2024-01-15 10:30:17 [info]: 📋 Step: Verify page title contains "Login"
2024-01-15 10:30:18 [info]: 📸 Screenshot captured: screenshots/login_page_loaded.png
2024-01-15 10:30:18 [info]: ✅ Test passed: should load login page successfully
```

## 📂 Project Structure

``` markdown
selenium-ui-test-boilerplate/
├── .github/
│   └── workflows/
│       └── test.yml          # CI/CD pipeline
├── tests/
│   ├── login.test.js         # Login functionality tests
│   └── dashboard.test.js     # Dashboard navigation tests
├── utils/
│   ├── setup.js              # WebDriver configuration & management
│   └── logger.js             # Logging utilities
├── screenshots/              # Auto-generated screenshots
├── logs/                     # Test execution logs
├── test-results/             # JUnit XML reports
├── package.json              # Dependencies and scripts
├── jest.config.js            # Test configuration
└── README.md                 # This file
```

## 🎯 Test Examples

### Login Tests

- ✅ Page loading verification
- ✅ Successful authentication
- ✅ Invalid credentials handling
- 📸 Screenshots for each scenario

### Dashboard Tests

- ✅ Secure area access
- ✅ Logout functionality
- ✅ Unauthorized access prevention
- 📋 Step-by-step logging

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BROWSER` | Browser to use (chrome/firefox) | `chrome` |
| `HEADLESS` | Run in headless mode | `false` |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | `info` |

### Browser Options

The setup includes security-focused browser configurations:

- Disabled unnecessary features for faster execution
- Sandboxing for security
- Optimized window sizing
- Memory usage optimization

## 🚀 CI/CD Integration

This project includes a comprehensive GitHub Actions workflow:

- ✅ **Matrix testing** across multiple browsers and Node.js versions
- 🛡️ **Security scanning** with npm audit
- 📊 **Artifact collection** for screenshots and logs
- ⏰ **Scheduled runs** for continuous monitoring

## 🛡️ Security Best Practices

- 🔒 **No hardcoded credentials** (uses test site credentials)
- 🚫 **Disabled unnecessary browser features**
- 📝 **Audit logging** for all test actions
- 🛡️ **Dependency security scanning**
- 🔄 **Regular security updates** via CI

## 🧠 Future Enhancements

- [ ] Page Object Model implementation
- [ ] Visual regression testing integration
- [ ] Mobile browser support
- [ ] Docker containerization
- [ ] Parallel test execution
- [ ] API test integration
- [ ] Performance monitoring
- [ ] Custom reporting dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Browser not found:**

```bash
# Install Chrome
sudo apt-get update && sudo apt-get install -y google-chrome-stable

# Install Firefox
sudo apt-get install -y firefox
```

**Permission errors:**

```bash
# Fix permissions on Unix systems
chmod +x node_modules/.bin/*
```

**Screenshot directory:**

```bash
# Ensure directories exist
mkdir -p screenshots logs test-results
```

## 📞 Support

- 📧 Open an issue for bug reports
- 💡 Suggest features via GitHub Issues
- 📖 Check the [Wiki](../../wiki) for detailed guides
- 🌟 Star the repo if you find it helpful!

## Made with ❤️ for the QA Community
