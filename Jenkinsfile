pipeline {
    agent any

    parameters {
        string(name: 'APP_NAME', defaultValue: 's3-config-app', description: 'Application/Docker name')
        string(name: 'APP_PORT', defaultValue: '3000', description: 'Port the app listens on')
        string(name: 'AWS_REGION', defaultValue: 'us-east-1', description: 'AWS region where the S3 bucket resides')
        string(name: 'S3_BUCKET', defaultValue: 'sample-nodejs-s3-ridhima', description: 'Bucket containing the config JSON')
        string(name: 'S3_KEY', defaultValue: 'test.json', description: 'Key/path of the config JSON object')
    }

    environment {
        DOCKER_IMAGE = "${params.APP_NAME}:${env.BUILD_NUMBER}"
        SONAR_TOKEN = credentials('sonarqube-token')
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
    }

    stages {
        stage('Build Node App') {
            steps {
                sh 'npm install'
                sh 'npm run build --if-present'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh """
                    sonar-scanner \\
                      -Dsonar.projectKey=${params.APP_NAME} \\
                      -Dsonar.sources=src \\
                      -Dsonar.host.url=http://localhost:9000 \\
                      -Dsonar.login=${SONAR_TOKEN}
                """
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }

        stage('Run Container') {
            steps {
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
