pipeline {
  agent any
  environment {
    SEMGREP_IMAGE = 'semgrep/semgrep:latest'
  }
  stages {
    stage('Informacion') {
      steps {
        echo "Analizando el commit ${env.GIT_COMMIT}"
        sh 'docker run --rm $SEMGREP_IMAGE semgrep --version'
      }
    }
    stage('SAST - Semgrep') {
      steps {
        sh '''
          docker run --rm \
            -u "$(id -u):$(id -g)" -e HOME=/tmp \
            -v "$WORKSPACE:/src" -w /src \
            $SEMGREP_IMAGE semgrep scan \
            --config auto \
            --config semgrep-reglas/reglas-propias.yml \
            --exclude semgrep-reglas \
            --json-output=semgrep-reporte.json \
            --sarif-output=semgrep-reporte.sarif
        '''
      }
    }
    stage('Security Gate') {
      steps {
        sh 'python3 ci/security_gate.py semgrep-reporte.json'
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: 'semgrep-reporte.*', allowEmptyArchive: true
    }
    success {
      echo 'Pipeline APROBADO: el codigo paso el security gate.'
    }
    failure {
      echo 'Pipeline DETENIDO: se encontraron vulnerabilidades de severidad alta.'
    }
  }
}
