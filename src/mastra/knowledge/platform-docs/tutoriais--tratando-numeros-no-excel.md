---
title: "Tratando números no Excel"
description: ""
source: https://documentacao-geniosdossistemas.gitbook.io/zapn/tutoriais/tratando-numeros-no-excel
---

# Tratando números no Excel

### Como formatar como 55DDDnúmero

Primeiro passo é saber que será necessário remover todas as linhas em brancas entre os números além de caracteres especiais.

Vamos dividir o tutorial nas seguintes etapas

1. Excluir linhas em branco
2. Remover caracteres especiais
3. Formatando os números
4. Remover números duplicados

### Excluir linhas em branco

Comece selecionando a coluna onde encontram os seus números. Na aba **Página Inicial**, selecione **Pesquisar e Localizar** e logo em seguida em **Ir para Especial...**

Uma nova janela irá se abrir. Selecione a opção **Em branco** e logo em seguida clique em **OK**.&#x20;

Ao fazer isso, todas as células em branco desse intervalo serão selecionadas. Agora, clique em **Página Inicial**, depois em **Excluir** e logo em seguida a primeira opção **Excluir Células**. Uma nova janela irá se abrir.

Com essa nova janela aberta, clique em **Linha Inteira** e logo em seguida clique em **OK.**

Pronto, sua células em branco no intervalo foram removidas.

### Remover caracteres especiais

Comece selecionando o intervalo dos seus números. Logo em seguida, Na aba **Página Inicial**, selecione **Pesquisar e Localizar** e logo em seguida em **Substituir.**

Use o campo **Localizar** para escrever o caractere que deseja remover e o campo **Substituir por** você pode deixar em branco. Clique em **Localizar tudo** e logo em seguida clique em **Substituir tudo.** Repita o processo para todos os caractres que deseja demover como (, ), -, +

Para remover o espaço entre os números, basta colocar no campo **Localizar** um espaço conforme indicado na próxima imagem. Clique em **Localizar tudo** e logo em seguida em **Substituir tudo**.

### Formatando os números

Para formatar o seu número corretamente, iremos adicionar o 55. Caso ainda não tenha o ddd adicionado número, no lugar do 55 você irá adicionar 55ddd. (exemplo: 5511)

Na coluna ao lado do primeiro número você irá adcionar ***="55"&*** e selecionar a célula ao lago (onde está o número) conforme indicado na imagem.

Logo em seguida, aperte a tecla *ENTER* para validar a fórmula e logo em seguida clique no quadradinho verde (indicado pela flecha) e arraste para expandir a fórmula para os outros números.

Agora vamos remover a referencia da formula para manter apenas o número. Selecione o seu intervalo, clique CTRL+C para copiar. Vá até a aba **Página Inicial**, clique em  **Colar** e na parte de **Colar Valores** selecione a primeira opção.&#x20;

Agora, será necessário clicar no icone de *atenção ao lado esquerdo da célula* e logo em seguida **Converter para número**.

Não se preocupe se seu número estiver assim (formato de notação científica). Vamos converter esse formato para número. Selecione a coluna e, na aba **Página Inicial,** no dropdown indicado, selecione a opção **Números**. Para finalizar, basta remover as casas decimais clicando 2 vezes no botão indicado na imagem a direita.

### Remover números duplicados

Para remover números duplicados, comece selecionando o intervalo dos seu números. Selecione a coluna e, na aba **Dados** na região de **Ferramenta de dados** selecione a opção de *remover duplicadas*.

Uma nova janela irá se abrir. Clique em **OK**.

Pronto. Agora sua lista já está formatada. Para importar seus contatos no ZAPN, siga o tutorial [**Importando Contatos em Listas**](/zapn/tutoriais/importar-lista-de-contatos.md)

> **Nota:** É importante destacar que você não precisa remover as duplicadas, isso que porque o ZAPN irá fazer essa validação. **PORÉM,** remover números duplicados irá fazer a importação da sua lista mais rápida.
