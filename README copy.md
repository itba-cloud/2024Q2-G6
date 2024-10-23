
<h1 align="center" href="https://docs.aws.amazon.com/?nc2=h_ql_doc_do&refid=d4b6ebcb-1bab-48ea-bd64-310bd8b10d2a" style="display: block; font-size: 2.5em; font-weight: bold; margin-block-start: 1em; margin-block-end: 1em;">
<a name="logo"><img align="center" src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" alt="AWS" style="width:50%;height:100%"/></a>
  <br /><br /><strong><em>PickItUp</em> - Cloud Computing Project</strong>
</h1>

## Table of contents[![](https://raw.githubusercontent.com/aregtech/areg-sdk/master/docs/img/pin.svg)](#table-of-contents) 
- [Table of contents](#table-of-contents)
- [Descripción del proyecto ](#descripción-del-proyecto-)
- [Cómo correr el proyecto ](#cómo-correr-el-proyecto-)
- [Arquitectura ](#arquitectura-)
- [Requerimientos TP3 ](#requerimientos-tp3-)
  - [Módulo externo (vpc)](#módulo-externo-vpc)
  - [Módulo interno (web-app)](#módulo-interno-web-app)
- [Crear usuario administrador](#crear-usuario-administrador)


## Descripción del proyecto [![](https://raw.githubusercontent.com/aregtech/areg-sdk/master/docs/img/pin.svg)](#descripción-del-proyecto) 

Este proyecto propone el desarrollo de una plataforma que permita a los usuarios visualizar productos disponibles, reservarlos y recogerlos en un punto físico.

## Cómo correr el proyecto [![](https://raw.githubusercontent.com/aregtech/areg-sdk/master/docs/img/pin.svg)](#cómo-correr-el-proyecto) 
TODO

## Arquitectura [![](https://raw.githubusercontent.com/aregtech/areg-sdk/master/docs/img/pin.svg)](#arquitectura) 
TODO

## Requerimientos TP3 [![](https://raw.githubusercontent.com/aregtech/areg-sdk/master/docs/img/pin.svg)](#requerimientos-tp3) 

### Módulo externo (vpc)

### Módulo interno (web-app)

## Crear usuario administrador[![](https://raw.githubusercontent.com/aregtech/areg-sdk/master/docs/img/pin.svg)](#crear-usuario-administrador) 
Algunos endpoints del sistema requieren permisos adicionales, ya que ciertas funcionalidades, como la gestión de reservas o la adición de stock, están restringidas exclusivamente para los administradores del sistema. Por defecto, los usuarios no tienen acceso a estos permisos.

Para habilitar el acceso a estos endpoints administrativos, deben seguirse los siguientes pasos:

- Acceder a la consola de AWS Cognito.
- Dirigirse al user pool llamado `cloud-user-pool`.
- Seleccionar el usuario al que se desea otorgar permisos.
- En la sección Group memberships, agregar al usuario al grupo `product-admins`.
- De esta manera, el usuario tendrá los permisos necesarios para interactuar con los endpoints restringidos a administradores.