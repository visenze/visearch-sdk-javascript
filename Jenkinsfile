@Library('visenze-lib')_

GIT_REPO = "visenze/visearch-sdk-javascript"

def getVersion() {
  def version = sh(script: "npm run get-version --silent", returnStdout: true).trim()
  return version
}

pipeline {
  agent {
    label "${params.AGENT_LABEL ?: 'build-amd64'}"
  }

  environment {
    SEARCH_PLACEMENT_ID = 2967
    SEARCH_IM_URL = "https://cdn.visenze.com/images/widget-2.jpg"
    REC_PLACEMENT_ID = 1823
    REC_PID = "184827-09"
    ENDPOINT = "https://search-dev.visenze.com"
  }

  tools {
    nodejs('NodeJS14')
  }

  stages {
    stage('Test') {
      steps {
        script {
          sh 'npm ci'
          sh 'npm run write-version'
          sh 'npx tsc'
          withCredentials([
            string(credentialsId: 'search.sg.app-1823.staging', variable: 'SEARCH_APP_KEY'),
            string(credentialsId: 'rec.sg.app-2967.staging', variable: 'REC_APP_KEY'),
          ]) {
            codeclimate.testWithCoverage({
              sh 'npm run test-with-coverage'
            })
          }
        }
      }
    }

    stage('Tag') {
      steps {
        script {
          if (env.BRANCH_NAME == 'master') {
            def version = getVersion()
            build(
              job: 'devops_github_utility_create_release',
              parameters: [
                string(name: 'GITHUB_REPO', value: GIT_REPO),
                string(name: 'TAG_NAME', value: version),
                string(name: 'TARGET_COMMITISH', value: 'master'),
                string(name: 'NAME', value: "${version} Release"),
                string(name: 'BODY', value: "Auto release by Jenkins"),
              ]
            )
          }
        }
      }
    }
  }
}
