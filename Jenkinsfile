// FoodNexus fe-deployment — full CI/CD aligned with nutriflow_org/jenkins/Jenkinsfile: build → Docker push → optional kubectl apply / set-image / rollout.
//
// Replace: REGISTRY (no scheme), REPLACE_APP image repo name, GIT credentials/URL, REGISTRY_CREDENTIALS_ID, REPLACE_KUBECONFIG_CREDENTIAL_ID.
// Repo vendors SPA manifests under k8s/ — tune image in REPLACE_APP to match Docker push target.

pipeline {
  agent none

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    booleanParam(
      name: 'APPLY_MANIFESTS',
      defaultValue: false,
      description: 'kubectl apply k8s/frontend-application-azure.yaml + frontend-application-ingress.yaml'
    )
    booleanParam(
      name: 'RESTART_FRONTEND',
      defaultValue: true,
      description: 'kubectl rollout restart deployment/frontend-application'
    )
    booleanParam(
      name: 'SET_DEPLOYMENT_IMAGE',
      defaultValue: true,
      description: 'After push: kubectl set image container frontend to IMAGE_NAME:IMAGE_TAG'
    )
    string(name: 'MANIFEST_DIR', defaultValue: 'k8s', description: 'Relative to workspace (this repo: k8s/)')
    string(name: 'BUILD_TOOL_COMMAND', defaultValue: '', description: 'Optional pre-Docker check, e.g. npm run lint — empty skips')
    string(name: 'KUBE_NAMESPACE', defaultValue: 'default', description: 'Namespace for rollout')
    string(name: 'FRONTEND_DEPLOYMENT', defaultValue: 'frontend-application', description: 'Deployment name')
  }

  environment {
    REGISTRY = 'REPLACE_REGISTRY_HOST/project'
    IMAGE_NAME = "${REGISTRY}/REPLACE_APP"
    IMAGE_TAG = "${env.BUILD_NUMBER}"
    GIT_CREDENTIALS_ID = 'REPLACE_GIT_CRED'
    GIT_URL = 'REPLACE_GIT_URL'
    REGISTRY_CREDENTIALS_ID = 'REPLACE_REGISTRY_CRED'
    AGENT_LABEL_DOCKER = 'docker'
    AGENT_LABEL_KUBECTL = 'k8s-rollout'
  }

  stages {
    stage('Build and push image') {
      agent { label "${AGENT_LABEL_DOCKER}" }
      stages {
        stage('Checkout') {
          steps {
            checkout([
              $class: 'GitSCM',
              branches: [[name: '*/main']],
              extensions: [],
              userRemoteConfigs: [[credentialsId: "${GIT_CREDENTIALS_ID}", url: "${GIT_URL}"]]
            ])
          }
        }

        stage('Optional pre-Docker checks') {
          steps {
            withEnv(["BUILD_TOOL_COMMAND=${params.BUILD_TOOL_COMMAND ?: ''}"]) {
              sh '''
                set -euo pipefail
                if [ -z "${BUILD_TOOL_COMMAND:-}" ]; then
                  echo "No BUILD_TOOL_COMMAND — production build runs inside Dockerfile."
                else
                  docker run --rm -u "$(id -u):$(id -g)" \
                    -v "${WORKSPACE}:/ws" -w /ws \
                    node:20-bookworm bash -lc "${BUILD_TOOL_COMMAND}"
                fi
              '''
            }
          }
        }

        stage('Docker build & push') {
          steps {
            sh 'docker version'
            script {
              docker.withRegistry("https://${REGISTRY}", env.REGISTRY_CREDENTIALS_ID) {
                def img = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                img.push()
                img.push('latest')
              }
            }
          }
        }
      }
    }

    stage('Kubernetes rollout') {
      agent { label "${AGENT_LABEL_KUBECTL}" }
      when {
        anyOf {
          expression { params.APPLY_MANIFESTS }
          expression { params.RESTART_FRONTEND }
          expression { params.SET_DEPLOYMENT_IMAGE }
        }
      }
      environment {
        KUBECONFIG = credentials('REPLACE_KUBECONFIG_CREDENTIAL_ID')
      }
      stages {
        stage('Checkout (rollout)') {
          steps {
            checkout([
              $class: 'GitSCM',
              branches: [[name: '*/main']],
              extensions: [],
              userRemoteConfigs: [[credentialsId: "${GIT_CREDENTIALS_ID}", url: "${GIT_URL}"]]
            ])
          }
        }

        stage('kubectl apply manifests') {
          when { expression { return params.APPLY_MANIFESTS } }
          steps {
            withEnv(["MANIFEST_DIR=${params.MANIFEST_DIR ?: 'k8s'}"]) {
              sh '''
                set -euo pipefail
                kubectl version --client=true >/dev/null
                kubectl apply -f "${MANIFEST_DIR}/frontend-application-azure.yaml"
                kubectl apply -f "${MANIFEST_DIR}/frontend-application-ingress.yaml"
              '''
            }
          }
        }

        stage('kubectl set deployment image') {
          when { expression { return params.SET_DEPLOYMENT_IMAGE } }
          steps {
            withEnv(["KUBE_NAMESPACE=${params.KUBE_NAMESPACE ?: 'default'}", "FRONTEND_DEPLOYMENT=${params.FRONTEND_DEPLOYMENT ?: 'frontend-application'}"]) {
              sh '''
                set -euo pipefail
                kubectl set image "deployment/${FRONTEND_DEPLOYMENT}" "frontend=${IMAGE_NAME}:${IMAGE_TAG}" -n "${KUBE_NAMESPACE}"
              '''
            }
          }
        }

        stage('kubectl rollout restart') {
          when { expression { return params.RESTART_FRONTEND } }
          steps {
            withEnv(["KUBE_NAMESPACE=${params.KUBE_NAMESPACE ?: 'default'}", "FRONTEND_DEPLOYMENT=${params.FRONTEND_DEPLOYMENT ?: 'frontend-application'}"]) {
              sh '''
                set -euo pipefail
                kubectl rollout restart "deployment/${FRONTEND_DEPLOYMENT}" -n "${KUBE_NAMESPACE}"
                kubectl rollout status "deployment/${FRONTEND_DEPLOYMENT}" -n "${KUBE_NAMESPACE}" --timeout=300s
              '''
            }
          }
        }
      }
    }

    stage('Acceptance tests (placeholder)') {
      agent { label "${AGENT_LABEL_DOCKER}" }
      steps {
        sh 'echo "TODO: e2e / smoke URLs (Packt-style acceptance chapter)"'
      }
    }
  }

  post {
    always {
      echo 'Avoid logging kubeconfig or registry secrets; Jenkins credential masking for bound secrets.'
    }
  }
}
