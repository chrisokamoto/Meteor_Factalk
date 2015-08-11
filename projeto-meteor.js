Factalks = new Mongo.Collection("factalks");
TabularTables = {};

Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);

Router.configure({
  layoutTemplate: 'main'
});

TabularTables.Factalks = new Tabular.Table({
    name: "Factalks",
    collection: Factalks,
    columns: [
      {data: "titulo", title: "Título"},
      {data: "local", title: "Local"},
      {data: "data", title: "Data"},
      {data: "hora", title: "Hora"},
      {tmpl: Meteor.isClient && Template.editCell},
      {tmpl: Meteor.isClient && Template.deleteCell}      
    ]
  });

if (Meteor.isClient) {
  Meteor.subscribe("factalks");

  Template.cursos_resumo.helpers({
    factalks: function(){
      return Factalks.find({}, {sort: {data: -1}});
    }    
  });

  Template.novo_factalk.events({
    "submit form": function(event){      
      var titulo = event.target.titulo.value;
      var local = event.target.local.value;
      var resumo = event.target.resumo.value;
      var data = event.target.data.value;
      var hora = event.target.hora.value;      

      Meteor.call("addFactalk", titulo, local, resumo, data, hora);

      event.target.titulo.value = "";
      event.target.local.value = "";
      event.target.resumo.value = "";
      event.target.data.value = "";
      event.target.hora.value = "";

      return false;
    }    
  });
  // counter starts at 0
  Session.setDefault('counter', 0);

 /* Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });*/
  Template.register.events({
    'submit form': function(event){      
      event.preventDefault();      
    }
  });

  Template.navigation.events({
    'click .logout': function(event){
      event.preventDefault();
      Meteor.logout();
      Router.go('login');
    }
  });

  Template.login.events({
    'submit form': function(event){      
      event.preventDefault();      
    }
  });

  Template.login.onRendered(function(){    
    var validator = $('.login').validate({
      submitHandler: function(event){
        var username = $('[name=username]').val();
        var password = $('[name=password]').val();

        Meteor.loginWithPassword(username, password, function(error){
          if(error){
            if(error.reason == "User not found"){
              validator.showErrors({
                username: "Usuário não cadastrado no sistema"
              });            
            }
            if(error.reason == "Incorrect password"){
              validator.showErrors({
                password: "Senha inválida"
              });            
            }
          } else{
            var currentRoute = Router.current().route.getName();
            if(currentRoute == "login")
              Router.go('home');
          }
        }); 
      }
    });
  });

  Template.register.onRendered(function(){    
    var validator = $('.register').validate({
      submitHandler: function(event){
        var username = $('[name=username]').val();
        var password = $('[name=password]').val();

        Accounts.createUser({
          username: username,
          password: password
        }, function(error){
          if(error){            
            if(error.reason == "Username already exists."){
              validator.showErrors({
                username: "Username já em uso"
              });            
            }
          } else
            Router.go('home');
        });
      }
    });
  });

  Template.gerenciar_factalks.helpers({
    selector: function () {
      return {coordenador: Meteor.user().username};
    }
  });  

  $.validator.setDefaults({
    rules: {
        password: {
          minlength: 6
        }
      },
      messages: {
        username: {
          required: 'Campo obrigatório.',
        },
        password: {
          required: 'Campo obrigatório.',
          minlength: 'Sua senha deve ter no mínimo {0} caracteres.'
        }
      }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.publish("factalks", function(){
    return Factalks.find({});
  });
}

Router.route('/register');
Router.route('/login', {
  name: 'login',
  template: 'login'
});

Router.route('/', {
  name: 'home',
  template: 'home',
  onBeforeAction: function(){
    var currentUser = Meteor.userId();
    if(currentUser)
      this.next();
    else
      this.render('login');
  }
});

Router.route('/novo', {
  name: 'novo_factalk',
  template: 'novo_factalk',
  onBeforeAction: function(){
    var currentUser = Meteor.userId();
    if(currentUser)
      this.next();
    else
      this.render('login');
  }
});

Router.route('/gerenciar', {
  name: 'gerenciar_factalks',
  template: 'gerenciar_factalks',
  onBeforeAction: function(){
    var currentUser = Meteor.userId();
    if(currentUser)
      this.next();
    else
      this.render('login');
  }
});

Meteor.methods({
  addFactalk: function(titulo, local, resumo, data, hora){
    if(!Meteor.userId()){
      throw new Meteor.Error("Você não está logado!");
    }
    Factalks.insert({
      titulo: titulo,
      local: local,
      resumo: resumo,
      data: data,
      hora: hora,
      createdAt: new Date(),
      coordenador: Meteor.user().username
    });

    Router.go('home');
  }
});
