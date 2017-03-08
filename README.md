# Mail Render
Base E-mail MKT

## Installation

Install package.
```sh
npm install -g mailrender
```
###  or
```sh
yarn global add mailrender
```

## Setup
```sh
mailrender start
```

## Runing
```sh
mailrender run
```

#### Options

- **--no**: Don\'t open browser tab
- **--production**: Don\'t open browser tab



## Configurations


### Configurações Globais:

- **default**: configurações padrão do sistema, tudo que é global deve estar em "default".

	- **key**: Chave única do projeto geralmente usada como a pasta container ex: 20161213_feirao-de-fabrica-sul

	- **title**: Título do projeto
	- **url**: Url de destino geral ex: "http://loja.compracerta.com.br" todos componentes que não forem direcionados especificamente irão assumir esse caminho
	- **width**: Largura do projeto ex "640" (NÂO tem a unidade de medida)
	- **path**: Url dos arquivos (assets) ex: "http://dev.jussilabs.com/ztemp/"
	- **params**: todos os parametros das URLs de cada link ex: "utm_campaign": "hotsite_colaborador" (todos os parametros devem estar com Chave/valor)
	- **term**: texto complemento/informativo, tratado como texto legal

### Components

- **type**: tipo do componente
- **email**: [fixed, responsive]
- **banner**: [full, responsive, coupon, video]
- **shelf**: [static, shelf, offer, coupon, static]
	OBS: static, formato não responsivo, esse pode interferir em outros componentes responsivos.
- **class**: Uma ou mais classes de referencia ao componente
- **colN**: Numero de colunas de cada setor.
- **ctaW**: Largura do botão de cada setor.
- **ctaH**: Altura do botão de cada setor.

- **items**: todas as imagens/informações que compoem o componente
	- **dir**: Direção do conteudo [ltr, rtl]
	- **align**: Alinhamento horizontal do conteudo [left, center, right, justify]
	- **valign**: Alinhamento vertical do conteudo [baseline, length, %, sub, super, top, text-top, middle, - bottom, text-bottom, initial, inherit]
	- **sku**: Codigo sku do produto
	- **name**: Nome do conteúdo
	- **src**: Nome + extenção da imagem do produto
	- **alt**: Texto de alt da imagem
	- **tit**: Titulo referente ao conteúdo (Pode ser tratado como HTML)
	- **txt**: Texto referente ao conteúdo (Pode ser tratado como HTML)
	- **coupon**: Texto referente ao conteúdo ex: **1216REFRI50X** (Pode ser tratado como HTML)
	- **cta**: Texto do botão (Pode ser tratado como HTML)


## License
<a name="license"></a>

Copyright (c) 2016 Lucas Monteverde [@lucasmonteverde](https://lucasmonteverde.com))
Licensed under the MIT license.