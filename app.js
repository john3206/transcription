document.addEventListener('DOMContentLoaded', () => {
    const recordButton = document.getElementById('recordButton');
    const shareButton = document.getElementById('shareButton');
    const transcriptionElement = document.getElementById('transcription');
    let isRecording = false;
    let recognition = null;
    let lastTranscript = ''; // Para evitar repetições

    // Verificar suporte à API de reconhecimento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Seu navegador não suporta reconhecimento de voz. Use o Chrome no Android para melhor compatibilidade.');
        recordButton.disabled = true;
        return;
    }

    // Inicializar reconhecimento de voz
    recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false; // Desativar resultados parciais para reduzir repetições
    recognition.maxAlternatives = 3; // Aumentar alternativas para melhor precisão
    recognition.continuous = true; // Continuar gravando até parar explicitamente

    // Armazenar transcrição acumulada
    let accumulatedTranscript = '';

    // Atualizar transcrição evitando repetições
    recognition.onresult = (event) => {
        let newTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                newTranscript += event.results[i][0].transcript + ' ';
            }
        }
        // Filtrar repetições comparando com a última transcrição
        if (newTranscript !== lastTranscript) {
            accumulatedTranscript += newTranscript;
            transcriptionElement.value = accumulatedTranscript.trim();
            lastTranscript = newTranscript;
        }
    };

    // Tratar erros
    recognition.onerror = (event) => {
        console.error('Erro na transcrição:', event.error);
        if (event.error !== 'aborted') {
            alert('Erro na transcrição: ' + event.error);
            stopRecording();
        }
    };

    // Evitar parada automática
    recognition.onend = () => {
        if (isRecording) {
            // Reiniciar a gravação se ainda estiver no estado de gravação
            try {
                recognition.start();
            } catch (error) {
                console.error('Erro ao reiniciar gravação:', error);
                alert('Erro ao reiniciar gravação: ' + error.message);
                stopRecording();
            }
        }
    };

    // Função para iniciar gravação
    function startRecording() {
        if (!isRecording) {
            try {
                accumulatedTranscript = ''; // Limpar transcrição anterior
                transcriptionElement.value = ''; // Limpar textarea
                lastTranscript = ''; // Resetar última transcrição
                recognition.start();
                isRecording = true;
                recordButton.classList.add('recording');
                recordButton.title = 'Parar Gravação';
            } catch (error) {
                console.error('Erro ao iniciar gravação:', error);
                alert('Erro ao iniciar gravação: ' + error.message);
                stopRecording();
            }
        }
    }

    // Função para parar gravação
    function stopRecording() {
        if (isRecording) {
            try {
                isRecording = false; // Atualizar estado antes de parar
                recognition.stop();
                recordButton.classList.remove('recording');
                recordButton.title = 'Iniciar Gravação';
            } catch (error) {
                console.error('Erro ao parar gravação:', error);
                alert('Erro ao parar gravação: ' + error.message);
            }
        }
    }

    // Alternar gravação com o botão único
    recordButton.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });

    // Compartilhar no WhatsApp
    shareButton.addEventListener('click', () => {
        const text = transcriptionElement.value;
        if (!text) {
            alert('Nenhuma transcrição disponível para compartilhar.');
            return;
        }

        if (navigator.share) {
            navigator.share({
                title: 'Transcrição de Áudio',
                text: text,
            }).catch((error) => {
                console.error('Erro ao compartilhar:', error);
                alert('Erro ao compartilhar: ' + error.message);
            });
        } else {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');
        }
    });
});