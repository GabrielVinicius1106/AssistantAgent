# AI Agent App - NOTES

## Authentication / Authorization Principles

- *Autenticação:* Verificar Identidade de um USUÁRIO.

- *Autorização:* Verificar se o USUÁRIO AUTENTICADO possui PERMISSÃO para ACESSAR ALGUM RECURSO.

## Stateless and JWT (Json Web Token)

- No passado, aplicações utilizavam *Sessões* (Stateful). Criava-se um ID na Memória, e esse ID era enviado por Cookies.

- Ruim para *Escalabilidade*

- **JWT** possui uma *Arquitetura Stateless*

1. Login (email e senha)

2. Validação e Criação de JWT *Documento assinado DIGITALMENTE* *Contém INFORMAÇÕS DO USUÁRIO*

3. Envio de JWT p/ Client

4. Client envia o JWT em TODA REQUISIÇÃO. Servidor valida MATEMATICAMENTE o TOKEN.

## Estrutura do JWT

- String DIVIDIDA em TRÊS PARTES.
    > *Header.Payload.Signature*

    > **Header:** Defino o TIPO DO TOKEN e o ALGORITMO DE CRIPTOGRAFIA UTILIZADO (HMAC SHA256)
    > **Payload:** Dados do Usuário
    > **Signature:** Utiliza uma CHAVE SECRETA para APLICAR UM HASH no Header + Payload

import { jwt } from "jsonwebtoken"

const token = jwt.sign(<payload>, <JWT_SECRET>, <expires_in>)

## Idempotência

- Propriedade de APIs RESTful onde para determinado RECURSO, 1 ou 100 REQUISIÇÕES produzem o MESMO EFEITO.  


## Global Error Handler

- *Global Error Handler*
- app.setErrorHandler((error, _, res: FastifyReply) => {

    if(error instanceof ZodError){
        return res.status(400).send({
            message: "Validation Error.",
            issues: z.treeifyError(error)
        })
    }

    if(env.NODE_ENV != "development"){
        console.log(error);
    } else {
        // SOME TOOLING to WATCH THE ERRORS in PRODUCTION
    }

    return res.status(500).send({
        message: "Internal Server Error."
    })


 })


## Redis

- Aplicação para Sistemas de Cache