@Library('visenze-lib')_

GIT_REPO = "visenze/visearch-sdk-javascript"

def getVersion() {
  def version = sh(script: "npm run get-version --silent", returnStdout: true).trim()
  return version
}

pipeline {
  agent {
    label "${params.AGENT_LABEL ?: 'build'}"
  }

  tools {
    nodejs('NodeJS14')
  }

  stages {
    stage('Test') {
      steps {
        script {
          sh 'npm ci'
          sh 'npx tsc'
          codeclimate.testWithCoverage({
            sh 'npm run test-with-coverage'
          })
        }
      }
    }

    stage('Build') {
      steps {
        script {
          if (env.BRANCH_NAME == 'master') {
            def version = getVersion()
            build(
              job: 'devops_github_utility_create_release',
              parameters: [
                string(name: 'GITHUB_REPO', value: GIT_REPO),
                string(name: 'TAG_NAME', value: version),
                string(name: 'TARGET_COMMITISH', value: 'production'),
                string(name: 'NAME', value: "${version} Release"),
                string(name: 'BODY', value: "Auto release by Jenkins"),
              ]
            )
          }
        }
      }
    }

    stage('Archive') {
      steps {
        script {
          sh("echo widget_version=${env.BRANCH_NAME}.${getVersion()} > version.txt")
          archiveArtifacts('version.txt')
        }
      }
    }
  }
}
