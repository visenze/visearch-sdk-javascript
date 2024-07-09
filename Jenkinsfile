@Library('visenze-lib')_

GIT_REPO = "visenze/visearch-sdk-javascript"

def getVersion() {
  def version = sh(script: "npm run get-version --silent", returnStdout: true).trim()
  return version
}

def runDockerCmd(cmd, envVars = "") {
  return "docker run --rm -v ${WORKSPACE}:${WORKSPACE} ${envVars} -w ${WORKSPACE} node:16-bullseye-slim ${cmd}"
}

pipeline {
  agent {
    label "${params.AGENT_LABEL ?: 'build-arm64'}"
  }

  environment {
    SEARCH_PLACEMENT_ID = 2967
    SEARCH_IM_URL = "https://cdn.visenze.com/images/widget-2.jpg"
    REC_PLACEMENT_ID = 1823
    REC_PID = "184827-09"
    ENDPOINT = "https://search-dev.visenze.com"
  }

  stages {
    stage('Test') {
      steps {
        script {
          sh runDockerCmd('npm ci')
          sh runDockerCmd('npm run write-version')
          sh runDockerCmd('npx tsc')
          withCredentials([
            string(credentialsId: 'search.sg.app-1823.staging', variable: 'SEARCH_APP_KEY'),
            string(credentialsId: 'rec.sg.app-2967.staging', variable: 'REC_APP_KEY'),
          ]) {
            def envVars = "-e SEARCH_PLACEMENT_ID=${SEARCH_PLACEMENT_ID} -e SEARCH_IM_URL=${SEARCH_IM_URL} \
              -e REC_PLACEMENT_ID=${REC_PLACEMENT_ID} -e REC_PID=${REC_PID} \
              -e SEARCH_APP_KEY=${SEARCH_APP_KEY} -e REC_APP_KEY=${REC_APP_KEY} \
              -e ENDPOINT=${ENDPOINT}"
            codeclimate.testWithCoverage({
              sh runDockerCmd('npm run test-with-coverage', envVars)
            })
          }
        }
      }
    }

    stage('Tag') {
      when {
        branch 'production'
      }
      steps {
        script {
          def version = getVersion()
          build(
            job: 'devops_github_utility_create_release',
            parameters: [
              string(name: 'GITHUB_REPO', value: GIT_REPO),
              string(name: 'TAG_NAME', value: version),
              string(name: 'TARGET_COMMITISH', value: env.BRANCH_NAME),
              string(name: 'NAME', value: "${version} Release"),
              string(name: 'BODY', value: "Auto release by Jenkins"),
            ]
          )
        }
      }
    }
  }
}
