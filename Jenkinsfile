pipeline {
    agent any

    parameters {
        string(name: 'APP_NAME', defaultValue: 's3-config-app', description: 'Application/Docker name')
        string(name: 'APP_PORT', defaultValue: '3000', description: 'Port the app listens on')
        string(name: 'AWS_REGION', defaultValue: 'us-east-1', description: 'AWS region where the S3 bucket resides')
        string(name: 'S3_BUCKET', defaultValue: 'sample-nodejs-s3-ridhima', description: 'Bucket containing the config JSON')
        string(name: 'S3_KEY', defaultValue: 'test.json', description: 'Key/path of the config JSON object')
        string(name: 'SONAR_HOST_URL', defaultValue: 'http://host.docker.internal:9000', description: 'SonarQube server URL accessible from the Jenkins agent/container')
    }

    environment {
        DOCKER_IMAGE = "${params.APP_NAME}:${env.BUILD_NUMBER}"
        SONAR_TOKEN = credentials('sonarqube-token')
    }

    stages {
        stage('Build Node App') {
            steps {
                script {
                    def workspace = env.WORKSPACE ?: '.'
                    sh """
                        docker run --rm -u root \\
                          -v "${workspace}":/app -w /app \\
                          node:18-alpine \\
                          sh -c "npm install && npm run build --if-present"
                    """
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def workspace = env.WORKSPACE ?: '.'
                    sh """
                        docker run --rm \\
                          -e SONAR_HOST_URL=${params.SONAR_HOST_URL} \\
                          -e SONAR_LOGIN=${SONAR_TOKEN} \\
                          -v "${workspace}":/usr/src \\
                          sonarsource/sonar-scanner-cli \\
                          -Dsonar.projectKey=${params.APP_NAME} \\
                          -Dsonar.sources=src
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }

        stage('Run Container') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                                  credentialsId: 's3-access-user',
                                  accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                                  secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    sh """
                        docker rm -f ${params.APP_NAME} || true
                        docker run -d --name ${params.APP_NAME} -p ${params.APP_PORT}:${params.APP_PORT} \\
                          -e PORT=${params.APP_PORT} \\
                          -e AWS_REGION=${params.AWS_REGION} \\
                          -e S3_BUCKET=${params.S3_BUCKET} \\
                          -e S3_KEY=${params.S3_KEY} \\
                          -e AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} \\
                          -e AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} \\
                          ${DOCKER_IMAGE}
                    """
                }
            }
        }
    }
}
