pipeline {
    agent {
        docker {
            image 'node:16-alpine'  // Use Node.js image for building and testing the MERN app
            args '-v /var/run/docker.sock:/var/run/docker.sock'  // Mount Docker socket for Docker-in-Docker operations
        }
    }

    environment {
        REPO_URL = 'https://github.com/your-username/sample-mern-app.git'
        DOCKER_IMAGE_NAME_BACKEND = 'yourdockerhub/mern-backend'
        DOCKER_IMAGE_NAME_FRONTEND = 'yourdockerhub/mern-frontend'
        DOCKER_IMAGE_NAME_DB = 'yourdockerhub/mern-db'
        DOCKER_CRED = credentials('docker-hub-credentials')
        TRIVY_IMAGE = 'aquasec/trivy:latest'
        SONARQUBE_SERVER = 'SonarQube'
        TAG = "v1.${BUILD_NUMBER}"  // Dynamically generate version based on Jenkins build number
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()  // Clean workspace before starting the pipeline
            }
        }

        stage('Checkout Code') {
            steps {
                echo "Cloning the repository..."
                git branch: 'main', url: "${REPO_URL}"  // Checkout the latest code from the GitHub repository
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "Installing dependencies..."
                sh 'npm install'  // Install backend dependencies
                dir('frontend') {
                    sh 'npm install'  // Install frontend dependencies
                }
            }
        }

        stage('Lint and Test') {
            steps {
                echo "Running linting and tests..."
                sh 'npm run lint'  // Run linter for backend
                sh 'npm test'  // Run backend tests
                dir('frontend') {
                    sh 'npm run lint'  // Run linter for frontend
                    sh 'npm test'  // Run frontend tests
                }
            }
        }

        stage('SonarQube Analysis') {
            environment {
                SONAR_TOKEN = credentials('sonarqube-token')
            }
            steps {
                echo "Running SonarQube analysis..."
                withSonarQubeEnv("${SONARQUBE_SERVER}") {
                    sh 'npm run sonar'  // Run SonarQube scan (ensure SonarQube properties are configured in the project)
                }
            }
        }

        stage('SonarQube Quality Gate') {
            steps {
                echo "Checking SonarQube Quality Gate..."
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true  // Check the quality gate
                }
            }
        }

        stage('Docker Build and Push') {
            steps {
                script {
                    echo "Building and pushing Docker images..."

                    // Backend Docker image
                    sh """
                        docker build -t ${DOCKER_IMAGE_NAME_BACKEND}:${TAG} -f Dockerfile.backend .
                        docker login -u ${DOCKER_CRED_USR} -p ${DOCKER_CRED_PSW}
                        docker push ${DOCKER_IMAGE_NAME_BACKEND}:${TAG}
                    """

                    // Frontend Docker image
                    sh """
                        docker build -t ${DOCKER_IMAGE_NAME_FRONTEND}:${TAG} -f Dockerfile.frontend ./frontend
                        docker push ${DOCKER_IMAGE_NAME_FRONTEND}:${TAG}
                    """

                    // Database Docker image (optional, if custom database image is used)
                    sh """
                        docker build -t ${DOCKER_IMAGE_NAME_DB}:${TAG} -f Dockerfile.db .
                        docker push ${DOCKER_IMAGE_NAME_DB}:${TAG}
                    """
                }
            }
        }

        stage('Trivy Image Scan') {
            steps {
                script {
                    echo "Running Trivy scan on Docker images..."
                    sh """
                        docker run --rm ${TRIVY_IMAGE} image ${DOCKER_IMAGE_NAME_BACKEND}:${TAG} --format json > trivy-backend-scan.json
                        docker run --rm ${TRIVY_IMAGE} image ${DOCKER_IMAGE_NAME_FRONTEND}:${TAG} --format json > trivy-frontend-scan.json
                    """
                    archiveArtifacts artifacts: 'trivy-*.json', fingerprint: true  // Archive Trivy scan results
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "Deploying to Kubernetes..."
                    sh "kubectl set image deployment/mern-backend mern-backend=${DOCKER_IMAGE_NAME_BACKEND}:${TAG} --record"
                    sh "kubectl set image deployment/mern-frontend mern-frontend=${DOCKER_IMAGE_NAME_FRONTEND}:${TAG} --record"
                }
            }
        }
    }

    post {
        always {
            cleanWs()  // Clean workspace after each build
        }
        success {
            echo "Build, test, and deployment successful!"
        }
        failure {
            echo "Build failed."
        }
    }
}
