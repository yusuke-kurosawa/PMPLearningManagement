#!/usr/bin/env node

/**
 * SDK Generation Script for PMP Learning Management API
 * Generates multi-language SDKs from OpenAPI specification
 * 
 * Usage: node scripts/generate-api-sdks.js [options]
 * Options:
 *   --lang <language>    Generate only specified language (typescript|python|java|csharp|go)
 *   --skip-examples      Skip generation of example code
 *   --skip-tests         Skip running post-generation tests
 *   --output-dir <dir>   Custom output directory
 *   --spec-file <file>   Custom OpenAPI spec file
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const { program } = require('commander');

// Configuration
const DEFAULT_CONFIG_FILE = './docs/api/sdk-config.json';
const DEFAULT_SPEC_FILE = './docs/api/openapi-spec.yaml';
const DEFAULT_OUTPUT_DIR = './docs/api/sdks';

class SDKGenerator {
  constructor(options = {}) {
    this.options = {
      configFile: options.configFile || DEFAULT_CONFIG_FILE,
      specFile: options.specFile || DEFAULT_SPEC_FILE,
      outputDir: options.outputDir || DEFAULT_OUTPUT_DIR,
      skipExamples: options.skipExamples || false,
      skipTests: options.skipTests || false,
      targetLang: options.targetLang || null,
      verbose: options.verbose || false
    };
    
    this.config = null;
    this.generatedSDKs = [];
  }

  async init() {
    try {
      this.log('🚀 Initializing SDK Generator...');
      
      // Load configuration
      const configData = await fs.readFile(this.options.configFile, 'utf8');
      this.config = JSON.parse(configData);
      
      // Validate OpenAPI spec file exists
      await fs.access(this.options.specFile);
      
      // Ensure output directory exists
      await this.ensureDir(this.options.outputDir);
      
      this.log('✅ Initialization complete');
    } catch (error) {
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  async generateAll() {
    this.log('📦 Starting SDK generation for all languages...');
    
    const generators = this.options.targetLang 
      ? this.config.generators.filter(gen => gen.lang === this.options.targetLang)
      : this.config.generators;

    if (generators.length === 0) {
      throw new Error(`No generators found for language: ${this.options.targetLang}`);
    }

    for (const generator of generators) {
      try {
        await this.generateSDK(generator);
        this.generatedSDKs.push(generator);
      } catch (error) {
        this.log(`❌ Failed to generate ${generator.lang} SDK: ${error.message}`, 'error');
        if (this.options.verbose) {
          console.error(error.stack);
        }
      }
    }

    this.log(`✅ Generated ${this.generatedSDKs.length}/${generators.length} SDKs successfully`);
  }

  async generateSDK(generator) {
    this.log(`🔨 Generating ${generator.lang} SDK...`);
    
    const outputPath = path.join(this.options.outputDir, generator.outputDir);
    await this.ensureDir(outputPath);

    // Build OpenAPI Generator command
    const command = this.buildGeneratorCommand(generator, outputPath);
    
    this.log(`Executing: ${command}`, 'verbose');
    
    try {
      execSync(command, { 
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        cwd: process.cwd()
      });
      
      this.log(`✅ ${generator.lang} SDK generated successfully`);
      
      // Generate examples if not skipped
      if (!this.options.skipExamples) {
        await this.generateExamples(generator, outputPath);
      }
      
      // Run post-generation commands
      if (!this.options.skipTests) {
        await this.runPostGenerationCommands(generator);
      }
      
    } catch (error) {
      throw new Error(`SDK generation failed: ${error.message}`);
    }
  }

  buildGeneratorCommand(generator, outputPath) {
    const baseCommand = [
      'npx @openapitools/openapi-generator-cli generate',
      `-g ${generator.name}`,
      `-i ${this.options.specFile}`,
      `-o ${outputPath}`,
      `--package-name ${this.config.packageName}`,
      `--invoker-package ${generator.additionalProperties?.invokerPackage || this.config.clientPackage}`,
      '--remove-operation-id-prefix',
      '--skip-validate-spec'
    ];

    // Add additional properties
    if (generator.additionalProperties) {
      for (const [key, value] of Object.entries(generator.additionalProperties)) {
        baseCommand.push(`--additional-properties=${key}=${value}`);
      }
    }

    // Add global properties
    if (generator.globalProperties) {
      for (const [key, value] of Object.entries(generator.globalProperties)) {
        baseCommand.push(`--global-property=${key}=${value}`);
      }
    }

    return baseCommand.join(' ');
  }

  async generateExamples(generator, outputPath) {
    this.log(`📝 Generating examples for ${generator.lang}...`);
    
    const exampleTemplates = this.config.examples[generator.lang];
    if (!exampleTemplates) {
      this.log(`⚠️  No example templates found for ${generator.lang}`, 'warning');
      return;
    }

    const examplesDir = path.join(outputPath, 'examples');
    await this.ensureDir(examplesDir);

    // Generate each example
    for (const [exampleName, templatePath] of Object.entries(exampleTemplates)) {
      try {
        const exampleContent = await this.generateExampleContent(generator.lang, exampleName);
        const exampleFile = path.join(examplesDir, path.basename(templatePath));
        await fs.writeFile(exampleFile, exampleContent);
        this.log(`✅ Generated example: ${exampleName}`);
      } catch (error) {
        this.log(`❌ Failed to generate example ${exampleName}: ${error.message}`, 'error');
      }
    }
  }

  async generateExampleContent(lang, exampleName) {
    // This would contain language-specific example templates
    // For now, returning basic templates for each language
    
    const templates = {
      typescript: {
        authentication: `
// Authentication Example - TypeScript
import { Configuration, AuthenticationApi, UserManagementApi } from '@pmp-learning/api-client';

async function authenticateAndGetProfile() {
  // Configure API client
  const config = new Configuration({
    basePath: 'https://api.pmplearning.com/v2'
  });
  
  const authApi = new AuthenticationApi(config);
  const userApi = new UserManagementApi(config);
  
  try {
    // Login
    const loginResponse = await authApi.loginUser({
      email: 'user@example.com',
      password: 'securepassword123',
      rememberMe: true
    });
    
    console.log('Login successful:', loginResponse.data.success);
    
    // Configure authenticated requests
    config.accessToken = loginResponse.data.tokens.accessToken;
    
    // Get user profile
    const profile = await userApi.getCurrentUser();
    console.log('User profile:', profile.data);
    
    return profile.data;
    
  } catch (error) {
    console.error('Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
authenticateAndGetProfile()
  .then(profile => console.log('Welcome,', profile.name))
  .catch(error => console.error('Error:', error));
`,
        learningProgress: `
// Learning Progress Example - TypeScript
import { Configuration, LearningProgressApi } from '@pmp-learning/api-client';

async function trackLearningProgress() {
  const config = new Configuration({
    basePath: 'https://api.pmplearning.com/v2',
    accessToken: 'your-jwt-token-here'
  });
  
  const learningApi = new LearningProgressApi(config);
  
  try {
    // Record a study session
    const sessionResponse = await learningApi.recordStudySession({
      processId: 'develop-project-charter',
      processName: 'Develop Project Charter',
      knowledgeArea: 'Integration',
      processGroup: 'Initiating',
      duration: 1800, // 30 minutes in seconds
      completed: true,
      notes: 'Focused on understanding business case and benefits management plan',
      confidence: 4,
      difficulty: 2
    });
    
    console.log('Study session recorded:', sessionResponse.data.session);
    
    // Get comprehensive progress
    const progressResponse = await learningApi.getLearningProgress({
      includeStats: true,
      includeRecommendations: true
    });
    
    const progress = progressResponse.data;
    console.log('Overall progress:', progress.overallProgress + '%');
    console.log('Current streak:', progress.studyStats.currentStreak + ' days');
    
    // Display knowledge area progress
    progress.knowledgeAreaProgress.forEach(area => {
      console.log(\`\${area.knowledgeArea}: \${area.completionRate}% complete\`);
    });
    
    return progress;
    
  } catch (error) {
    console.error('Learning progress error:', error.response?.data || error.message);
    throw error;
  }
}

trackLearningProgress();
`,
        mockExam: `
// Mock Exam Example - TypeScript
import { Configuration, AssessmentsApi } from '@pmp-learning/api-client';

class MockExamManager {
  private api: AssessmentsApi;
  
  constructor(accessToken: string) {
    const config = new Configuration({
      basePath: 'https://api.pmplearning.com/v2',
      accessToken: accessToken
    });
    this.api = new AssessmentsApi(config);
  }
  
  async startFullMockExam(): Promise<string> {
    try {
      const examResponse = await this.api.startMockExam({
        examType: 'full',
        questionCount: 180,
        timeLimit: 13800, // 230 minutes
        focusAreas: [],
        difficulty: 'mixed',
        includeExplanations: true
      });
      
      console.log('Mock exam started:', examResponse.data.id);
      return examResponse.data.id;
      
    } catch (error) {
      console.error('Failed to start exam:', error.response?.data || error.message);
      throw error;
    }
  }
  
  async submitAnswers(examId: string, answers: any[]): Promise<void> {
    try {
      await this.api.submitExamAnswers(examId, { answers });
      console.log(\`Submitted \${answers.length} answers\`);
      
    } catch (error) {
      console.error('Failed to submit answers:', error.response?.data || error.message);
      throw error;
    }
  }
  
  async completeExam(examId: string) {
    try {
      const resultResponse = await this.api.completeMockExam(examId);
      const result = resultResponse.data;
      
      console.log(\`Exam completed! Score: \${result.score}/\${result.totalQuestions}\`);
      console.log('Passed:', result.passed ? 'Yes' : 'No');
      console.log('Strengths:', result.detailedAnalysis.strengths);
      console.log('Areas for improvement:', result.detailedAnalysis.weaknesses);
      
      return result;
      
    } catch (error) {
      console.error('Failed to complete exam:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Usage example
async function takeFullMockExam() {
  const examManager = new MockExamManager('your-jwt-token-here');
  
  // Start exam
  const examId = await examManager.startFullMockExam();
  
  // Simulate answering questions
  const answers = [
    { questionId: 'q1', selectedOption: 'a', timeSpent: 90 },
    { questionId: 'q2', selectedOption: 'c', timeSpent: 75 },
    // ... more answers
  ];
  
  await examManager.submitAnswers(examId, answers);
  
  // Complete exam and get results
  const results = await examManager.completeExam(examId);
  
  return results;
}

takeFullMockExam();
`
      },
      python: {
        authentication: `
# Authentication Example - Python
import pmp_learning_api
from pmp_learning_api.api import authentication_api, user_management_api
from pmp_learning_api.model.login_request import LoginRequest
from pmp_learning_api.exceptions import ApiException

def authenticate_and_get_profile():
    """
    Authenticate user and retrieve profile information
    """
    # Configure API client
    configuration = pmp_learning_api.Configuration(
        host='https://api.pmplearning.com/v2'
    )
    
    # Create API instances
    with pmp_learning_api.ApiClient(configuration) as api_client:
        auth_api = authentication_api.AuthenticationApi(api_client)
        user_api = user_management_api.UserManagementApi(api_client)
        
        try:
            # Login request
            login_request = LoginRequest(
                email='user@example.com',
                password='securepassword123',
                remember_me=True
            )
            
            # Perform login
            login_response = auth_api.login_user(login_request)
            print(f"Login successful: {login_response.success}")
            
            # Configure authenticated requests
            configuration.access_token = login_response.tokens.access_token
            
            # Get user profile
            profile_response = user_api.get_current_user()
            print(f"User profile: {profile_response.name}")
            
            return profile_response
            
        except ApiException as e:
            print(f"Authentication failed: {e}")
            raise

if __name__ == '__main__':
    profile = authenticate_and_get_profile()
    print(f"Welcome, {profile.name}!")
`,
        learning_progress: `
# Learning Progress Example - Python
import pmp_learning_api
from pmp_learning_api.api import learning_progress_api
from pmp_learning_api.model.study_session_request import StudySessionRequest
from pmp_learning_api.exceptions import ApiException

class LearningProgressTracker:
    def __init__(self, access_token):
        self.configuration = pmp_learning_api.Configuration(
            host='https://api.pmplearning.com/v2',
            access_token=access_token
        )
        
    def record_study_session(self, process_id, process_name, knowledge_area, 
                           process_group, duration, completed=True, notes=None):
        """
        Record a completed study session
        """
        with pmp_learning_api.ApiClient(self.configuration) as api_client:
            learning_api = learning_progress_api.LearningProgressApi(api_client)
            
            try:
                session_request = StudySessionRequest(
                    process_id=process_id,
                    process_name=process_name,
                    knowledge_area=knowledge_area,
                    process_group=process_group,
                    duration=duration,
                    completed=completed,
                    notes=notes
                )
                
                response = learning_api.record_study_session(session_request)
                print(f"Study session recorded: {response.session.id}")
                return response.session
                
            except ApiException as e:
                print(f"Failed to record session: {e}")
                raise
    
    def get_comprehensive_progress(self):
        """
        Get detailed learning progress with statistics
        """
        with pmp_learning_api.ApiClient(self.configuration) as api_client:
            learning_api = learning_progress_api.LearningProgressApi(api_client)
            
            try:
                progress = learning_api.get_learning_progress(
                    include_stats=True,
                    include_recommendations=True
                )
                
                print(f"Overall progress: {progress.overall_progress}%")
                print(f"Current streak: {progress.study_stats.current_streak} days")
                
                # Display knowledge area progress
                for area in progress.knowledge_area_progress:
                    print(f"{area.knowledge_area}: {area.completion_rate}% complete")
                
                return progress
                
            except ApiException as e:
                print(f"Failed to get progress: {e}")
                raise

# Usage example
if __name__ == '__main__':
    tracker = LearningProgressTracker('your-jwt-token-here')
    
    # Record a study session
    tracker.record_study_session(
        process_id='develop-project-charter',
        process_name='Develop Project Charter',
        knowledge_area='Integration',
        process_group='Initiating',
        duration=1800,  # 30 minutes
        notes='Focused on business case and benefits management'
    )
    
    # Get progress
    progress = tracker.get_comprehensive_progress()
`
      }
    };
    
    return templates[lang]?.[exampleName] || `// ${exampleName} example for ${lang} - Coming soon`;
  }

  async runPostGenerationCommands(generator) {
    const commands = this.config.postGenerationCommands?.find(cmd => cmd.lang === generator.lang);
    if (!commands) return;

    this.log(`🧪 Running post-generation commands for ${generator.lang}...`);
    
    for (const command of commands.commands) {
      try {
        this.log(`Executing: ${command}`, 'verbose');
        execSync(command, { 
          stdio: this.options.verbose ? 'inherit' : 'pipe'
        });
      } catch (error) {
        this.log(`⚠️  Post-generation command failed: ${command}`, 'warning');
        if (this.options.verbose) {
          console.error(error.message);
        }
      }
    }
  }

  async generateReadme() {
    this.log('📝 Generating SDK documentation...');
    
    const readmeContent = this.generateReadmeContent();
    const readmePath = path.join(this.options.outputDir, 'README.md');
    
    await fs.writeFile(readmePath, readmeContent);
    this.log('✅ SDK documentation generated');
  }

  generateReadmeContent() {
    return `# PMP Learning Management API SDKs

Official SDKs for the PMP Learning Management API, supporting multiple programming languages.

## Available SDKs

${this.generatedSDKs.map(sdk => `- **${sdk.lang}**: \`./sdks/${sdk.outputDir}\``).join('\n')}

## Quick Start

### TypeScript/JavaScript

\`\`\`bash
npm install @pmp-learning/api-client
\`\`\`

\`\`\`typescript
import { Configuration, AuthenticationApi } from '@pmp-learning/api-client';

const config = new Configuration({
  basePath: 'https://api.pmplearning.com/v2'
});

const authApi = new AuthenticationApi(config);
\`\`\`

### Python

\`\`\`bash
pip install pmp-learning-api
\`\`\`

\`\`\`python
import pmp_learning_api
from pmp_learning_api.api import authentication_api

configuration = pmp_learning_api.Configuration(
    host='https://api.pmplearning.com/v2'
)
\`\`\`

### Java

\`\`\`xml
<dependency>
    <groupId>com.pmplearning</groupId>
    <artifactId>pmp-learning-api-client</artifactId>
    <version>2.1.0</version>
</dependency>
\`\`\`

### C#

\`\`\`bash
dotnet add package PMPLearning.ApiClient
\`\`\`

## Features

- **Complete API Coverage**: All endpoints and models
- **Type Safety**: Full type definitions for all languages
- **Authentication**: Built-in JWT token management
- **Error Handling**: Comprehensive error handling
- **Examples**: Working examples for common use cases
- **Documentation**: Generated API documentation

## Authentication

All SDKs support JWT authentication:

1. Login to get access token
2. Configure client with token
3. Make authenticated requests

## Examples

Each SDK includes comprehensive examples:

- Authentication and user management
- Learning progress tracking
- Mock exam management
- AI coaching integration
- Collaboration features

## Support

- **Documentation**: https://docs.pmplearning.com
- **API Reference**: https://api.pmplearning.com/docs
- **Issues**: https://github.com/pmp-learning/api-issues

## License

MIT License - see LICENSE file for details.
`;
  }

  async ensureDir(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const levels = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      verbose: '🔍'
    };
    
    if (level === 'verbose' && !this.options.verbose) return;
    
    console.log(`${levels[level] || 'ℹ️'} [${timestamp}] ${message}`);
  }

  async generateSummaryReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalGenerators: this.config.generators.length,
      successfulGenerations: this.generatedSDKs.length,
      failedGenerations: this.config.generators.length - this.generatedSDKs.length,
      generatedLanguages: this.generatedSDKs.map(sdk => sdk.lang),
      options: this.options
    };

    const reportPath = path.join(this.options.outputDir, 'generation-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    this.log('📊 Generation summary:');
    this.log(`  Total generators: ${report.totalGenerators}`);
    this.log(`  Successful: ${report.successfulGenerations}`);
    this.log(`  Failed: ${report.failedGenerations}`);
    this.log(`  Languages: ${report.generatedLanguages.join(', ')}`);
  }
}

// CLI Interface
program
  .name('generate-api-sdks')
  .description('Generate multi-language SDKs for PMP Learning Management API')
  .version('2.1.0')
  .option('-l, --lang <language>', 'Generate only specified language')
  .option('-c, --config <file>', 'SDK configuration file', DEFAULT_CONFIG_FILE)
  .option('-s, --spec <file>', 'OpenAPI specification file', DEFAULT_SPEC_FILE)
  .option('-o, --output <dir>', 'Output directory', DEFAULT_OUTPUT_DIR)
  .option('--skip-examples', 'Skip generation of example code')
  .option('--skip-tests', 'Skip running post-generation tests')
  .option('-v, --verbose', 'Verbose output')
  .parse();

// Main execution
async function main() {
  const options = program.opts();
  
  const generator = new SDKGenerator({
    configFile: options.config,
    specFile: options.spec,
    outputDir: options.output,
    targetLang: options.lang,
    skipExamples: options.skipExamples,
    skipTests: options.skipTests,
    verbose: options.verbose
  });

  try {
    await generator.init();
    await generator.generateAll();
    await generator.generateReadme();
    await generator.generateSummaryReport();
    
    console.log('\n🎉 SDK generation completed successfully!');
    
  } catch (error) {
    console.error('\n❌ SDK generation failed:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { SDKGenerator };