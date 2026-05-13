// FoodNexus — Node/npm production build (Angular). Unit tests with Karma/Chrome are skipped by default.
pipeline {
  agent { label 'docker' }

  options {
    timestamps()
  }

  stages {
    stage('npm ci && build') {
      steps {
        sh '''
          set -euo pipefail
          docker run --rm -u "$(id -u):$(id -g)" \
            -v "${WORKSPACE}:/ws" -w /ws \
            -e npm_config_cache=/tmp/npm-cache \
            node:20-bookworm \
            bash -lc "npm ci && npm run build"
        '''
      }
    }
  }
}
