
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
          <img width={80} height={80} src={logo} alt=""/>
          <h3 className="white-text" >Bienvenido</h3>
          <button className=" waves-effect waves-light btn red"
           onClick={this.props.handleAuth}    // En caso de clic en el boton se ejecuta la funcion 
                                              // Que le pasamos como prop
          >
           Login
          </button>
      )
  }

  renderUserData() {  // Se ejecuta está función si existe un usuario,no es null
    return (
        <div className="white-text" style={fontFamily: 'Anton'} > //Etiqueta contenedora
          <img   // Aqui mostraremos la imagen de perfil del usuario
            className="circle" 
            width={80} 
            height={80} 
            src={this.props.user.photoURL} 
            alt=""
          >
          <h4>{this.props.user.displayName}</h4> // Mostrará el nombre de usuario
          <h6>{this.props.user.email}</h6> //Mostrará el email del usuario
          <button  //  Hacemos que se ejecute la funcion que le pasamos como prop en la clase App
            className="waves-effect waves-light btn red" 
            onClick={this.propos.handleLogout} 
          >
            Salir
          <button>
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
      usero: null
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
      <div class="center"> // Etiqueta contenedora
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

