# **Hello World VTEX**

## **Introdução**

Esse repositório é uma estrutura de arquivos e pastas utilizada na **Click - QI** para o
desenvolvimento do css e js em suas e soluções

## **Estrutura**

Devido a utilizarmos a plataforma da VTEX o projeto é divido em dois ambientes, que são **/store** e **/checkout** que cuidam respectivamente da loja em si (pagina inicial da loja, departamentos, produto e etc...) e do carrinho (toda a parte de compra do cliente após escolher um produto e colocar em seu carrinho). O projeto é composto por várias pastas e arquivos, vamos para as mais importantes e ver suas funcões no projeto.

### **/config**

Pasta onde ficam as configurações do webpack. (Não vamos nos aprofundar muito, mas caso queira entender como o webpack funciona e como ele atua em nosso projeto de uma olhada na documentação do webpack em https://webpack.js.org/concepts/).

### **/dist**

É aqui que fica o código final do css e js desenvolvido. O webpack pega todos os arquivos .css e .js que estão dentro da pasta /src/(store ou checkout, depende de qual ambiente se está desenvolvendo) realiza os devidos tratamentos em cada arquivo e os une para podermos os utilizar em nossa loja.

### **/src**

Aqui colocamos a mão na massa hehe... a mesma tem três pastas que são **/assets**, **/store** e **/checkout**.

- #### /assets
	- Onde ficam arquivos .css e .js com códigos padrões para o projeto

- #### /store
	- Aqui podemos ver a pasta **/components** e nela a estrutura de páginas similar a uma loja online, é aqui que podemos desenvolver nossas soluções da loja de forma modular, ou seja, podemos separar cada pedaço de código para seu devido lugar e assim ter muita facilidade de saber onde cada código ou até mesmo bugs estão, (obrigado webpack).

- #### /checkout
	- E por fim mas não menos importante a parte de checkout, seguindo o mesmo raciocínio da pasta **/store**, esta também tem uma pasta **/components** e nela a estrutura similar à um carrinho de compras, por aqui desenvolvemos as soluções para a área de carrinho da loja.

## **Iniciando o projeto**

Se chegou até aqui e está doido para ver como tudo isso funciona é simples, após clonar este repositório, apague a pasta .git de seu repositório ou copie todas as pastas e arquivos e cole em outra pasta, geralmente no windows a pasta .git fica oculta sendo assim não será copiada para a nova pasta.

Abra o terminal na raiz de seu projeto e execute o comando `npm install` ou `yarn install`, após a instalação de todas as dependências necessárias, temos que decidir em qual ambiente vamos desenvolver, então caso seja no ambiente **/store** execute o comando `npm run store-dev` ou `yarn store-dev`, caso seja no ambiente **/checkout** utilize `npm run checkout-dev` ou `yarn checkout-dev`, desta forma o webpack que não é nada bobo irá ficar de olho em qualquer alteração feita e salva, e irá alterar os arquivos da pasta **/dist**

Para gerar arquivos minificados temos os seguintes comandos:

```
npm run store-prod
npm run checkout-prod
```

ou para no yarn use:

```
yarn store-prod
yarn checkout-prod
```
