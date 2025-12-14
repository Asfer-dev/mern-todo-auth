pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('CI Build with Docker Compose (Volumes)') {
      steps {
        sh 'docker compose --profile ci up --abort-on-container-exit'
      }
    }
  }

  post {
    always {
      sh 'docker compose --profile ci down -v || true'
    }
  }
}
