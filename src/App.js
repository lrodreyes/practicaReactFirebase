import React, { Component } from 'react';
import * as firebase from 'firebase';

import logo from './logo.svg';

var config = {
  apiKey: "AIzaSyCHud7hKKaHbRxaTaXa5M-srmtdR-WXiTM",
  authDomain: "superapp-d874a.firebaseapp.com",
  databaseURL: "https://superapp-d874a.firebaseio.com",
  projectId: "superapp-d874a",
  storageBucket: "superapp-d874a.appspot.com",
  messagingSenderId: "263205504831"
}
firebase.initializeApp(config);

/*Clase login */
class Login extends Component {

  render() { 
    return (
        <div> // Etiqueta contenedora
          //Evalua si existe un usuario valido
          {this.props.user ? this.renderUserData() : this.renderLoginButton()}  
        </div>   
      )
  }

  renderLoginButton(){ // Se ejecuta está función si el usuario es null,no existe
    return (
        <div style={{fontFamily: 'Anton'}}>
          <img width={80} height={80} src={logo} alt=""/>
          <h3 className="white-text" >Bienvenido</h3>
          <button className=" waves-effect waves-light btn red"
           onClick={this.props.handleAuth}    // En caso de clic en el boton se ejecuta la funcion 
                                              // Que le pasamos como prop
          >
           Login
          </button>
        </div>
      )
  }

  renderUserData() {  // Se ejecuta está función si existe un usuario,no es null
    return (
        <div className="white-text" style={{fontFamily: 'Anton'}} > //Etiqueta contenedora
          <img   // Aqui mostraremos la imagen de perfil del usuario
            className="circle" 
            width={80} 
            height={80} 
            src={this.props.user.photoURL} 
            alt=""
          />
          <h4>{this.props.user.displayName}</h4> // Mostrará el nombre de usuario
          <h6>{this.props.user.email}</h6> //Mostrará el email del usuario
          <button  //  Hacemos que se ejecute la funcion que le pasamos como prop en la clase App
            className="waves-effect waves-light btn red" 
            onClick={this.props.handleLogout} 
          >
            Salir
          </button>
        </div>
      )
  }

  

  
}

class FileUpload extends Component{ 

    constructor() { //Constructor 
      super()
      this.state ={
        unploadValue:0 // así sabremos el tiempo de carga que lleva el archivo
      }
      
    }

    handleOnChange (event){  // Se ejecutará cuando input de tipo file cambie de archivo
      let file = event.target.files[0] // El evento trae consigo el cambio con la  dirección
                                      // del archivo que se quiere subir 

      let storageRef = firebase.storage().ref( // hacemos una referencia  al storage
        'Documentos/'+this.props.user.displayName+'/'+file.name // con el nombre de usuario
      ) // como carpeta y el nombre del archivo para que sea almacenado
      let task = storageRef.put(file) // Metemos el archivo en el storage 
                                      //y guardamos en task para ver el proceso y resultados

      task.on('state_changed', (snapshot) => { // Esto es un socket que está a la escucha
                                      //de los cambios en estado de la subida del archivo
        //Obtenemos el porcentaje de subida del archivo
        let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) *100
        // Actualizamos el estado de FileUpload para que se muestre 
        this.setState({
          unploadValue:percentage
        })

      }, (error) => { // En caso de que ocurra un error actualizamos el mensaje de error

        this.setState({message : `ha ocurridoun error ${error.message}`})

      }, () => { //si todo funciona correctamente y se termina de subir el archivo
        //Ahora almancenamos en la BD los datos del  archivo para poder 
        //Mostrarlo y hacer refencia en la BD y no en el Storage
        // El metodo push almacena en la bd el JSON y le asigna una id unica
        firebase.database().ref('Documentos/'+this.props.user.displayName).push({
            titulo : file.name,
            downloadURL : task.snapshot.downloadURL
        })
        //Actualizamos el 
        this.setState({
          message:"Archivo Subido"
        })

      })

    }
    
    render () {
      return (
        <div  >
          <input type='file' onChange={this.handleOnChange.bind(this)} />
          <div className="row">
              <div className="progress col l4 offset-l4 m4 offset-m4  s8 offset-s2 ">
                  <div className="determinate" 
                    style={{width : this.state.unploadValue +"%"}} 
                  >
                  </div> 
              </div>
          </div>
          <h6 className="white-text " style={{fontFamily: 'Baloo'}} >
            {this.state.unploadValue} %  {this.state.message}
          </h6>
        </div>
        )
    }
}

class DocumentItem extends Component {
  render() {
    return (
        <li className="collection-item avatar">
          <img src={this.props.doc.downloadURL} className="circle" alt=""/>
          <span className="title">{this.props.doc.titulo}</span>
          
        </li>
      )
  }
}

class DocumentsList extends Component{

  constructor(props) {
    super(props);
    this.state = {
      documents : []
    }
  }

  componentDidMount() {
    let t = this
    var docRef = firebase.database().ref('Documentos/' + t.props.user.displayName)
    docRef.on('value', function(snapshot) {
      let temp = []
      for (let doc in snapshot.val()){
        temp.push(snapshot.val()[doc])
      }
      t.setState({documents : temp})
    });
  }

  render() {
    return(
      <div className="col l4 offset-l4 m4 offset-m4  s10 offset-s1 ">
        <ul className="collection"  >
          {
            this.state.documents.map((doc) => (
                <DocumentItem  key={doc.downloadURL} doc={doc}/>
              ))
          }
        </ul>
      </div>
      )
  }

}

class App extends Component {

  constructor(props) {
    super(props);
    this.userOn = this.userOn.bind(this)    
    this.userOff = this.userOff.bind(this)
    this.state={
      user: null
    }
  }

  handleAuth(){
    //Creamos el provedor que será de Googlesignin
    var provider = new firebase.auth.GoogleAuthProvider();
    //Indicamos que el usuario se logueará en una ventana emergente 
    //Ademas de que le pasamos el provider como parametro
    firebase.auth().signInWithPopup(provider)
      .then((result) =>{
        //Creamos una referencia a la BD y actualizamos los datos del usuario 
        //sino existe lo creará y si existe actualizará los datos
        firebase.database().ref('Usuarios/' + result.user.displayName).update({
          username: result.user.displayName,
          email: result.user.email,
          foto: result.user.photoURL
        })

      })
      //En caso de que ocurra un error lo imprimirá en consola
      .catch(error => console.error(`Error : ${error.code}: ${error.message}`))
  }

  handleLogout(){
    //Hacemos que se elimine la sesión del usuario
    firebase.auth().signOut()
      .then(() =>{ //si todo ocurre correctamente 
        console.log('te has deslogeado')
      })
      //Si ocurrió un error muestra el error en cosola
      .catch(error => console.error(`Error : ${error.code}: ${error.message}`))
  }

  componentDidMount() {
    //Verifica si hay un cambio en en el estado del usaurio
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ user }) // Actualiza el estado de la app 
    })
  }

  render() { 
    return (
      <div className="center"> // Etiqueta contenedora
        <div>
          <Login               //Etiqueta de nuestro component Login 
            user={this.state.user} //Pasamos como props el obj user
            //Pasamos las funciones como Props pero al activar la funciones
            //bind(this) servira para que pueda utilizar las variables de
            // Esta clase App dentro de la clase Login 
            handleLogout={this.handleLogout.bind(this)} 
            handleAuth={this.handleAuth.bind(this)} 
          />
        </div>
          //Esto sirve para evaluar una variable en este caso this.state.user
          // Si es tienen un objeto dentro de ejecuta userOn() sino 
          // entonces se ejecutará userOff()
          {this.state.user ? this.userOn() : this.userOff() }
      </div>
    )
  }
  userOn(){   // Función que se ejecutará si existe user
    return (
      <div className="row">  // Etiqueta contenedora
          <h6 className="white-text"  
            style={{fontFamily: 'Baloo', paddingTop : "30px"}}
          >
            Sube tus imagenes
          </h6>
          //Instanciamos nuestro componente FileUpload pasando como 
          // props al usuario
          <FileUpload user={this.state.user} /> 
          //Instanciamos nuestro componente DocumentList pasando como 
          // props al usuario
          <DocumentsList user={this.state.user} />
      </div>
      )
  }
  userOff(){ //Función que se ejecuta sino existe el usuario
    return (
      <h5 className="white-text"   //Etiqueta contenedora 
        style={{fontFamily: 'Baloo', paddingTop : "30px"}}
      >
        Necesitas loguearte
      </h5>
      )
  }

  
}

export default App;
