import React, {Component} from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";

function App(){
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/recipes">Home</Link>
          </li>
          <li>
            <Link to="/add">Add a recipe</Link>
          </li>
        </ul>
        <Switch>
          <Route path="/recipes" component={RecipeList}>
          </Route>
          <Route path="/add">
            <AddForm />
          </Route>
          <Route path="/edit/:recipeId">
            <EditForm />
          </Route>
          <Route path="/">
            <Redirect to="/recipes"/>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

class RecipeList extends Component {
  constructor(props){
    super(props);
    this.state = {
      recipes: []
    };
  }

 

  render() {
  let data = Object.values(this.state.recipes)
  let match = this.props.match;
  return (<div>
      <Switch>
        <Route path={`${match.path}/:recipeId`} component={Recipe}/>
        <Route path={match.path}>
          <h2>Recipes</h2>
          <form acceptCharset="UTF-8" action="/recipes/" autoComplete="off" method="GET">
            <fieldset>
              <legend>Search:</legend>
                <label htmlFor="name">Name</label><br /> 
                <input name="name_like" type="search" placeholder="Name to search for (supports regex)" /> <br /> 
                <label htmlFor="category">Category</label><br /> 
                <input name="category_like" type="search" placeholder="Category to filter by (supports regex)" /> <br />
                <input name="_sort" type="hidden" value="createDate"/>
                <input defaultChecked={window.localStorage.getItem("asc")==="false"} onChange={sortChange} name="_order" type="radio" value="desc" /> New first <br /> 
                <input defaultChecked={window.localStorage.getItem("asc")==="true"} onChange={sortChange} name="_order" type="radio" value="asc" /> Old first <br />  
              <button type="submit">Search</button>
            </fieldset>
          </form>
          <ul>
            {data}
          </ul>
        </Route>
      </Switch>
    </div>)
  }

  componentDidMount() {
    let order = window.localStorage.asc
    if (order == null) order=true;
    let url = "http://localhost:3001/recipes"+(window.location.search)
    if (!window.location.search) url+="/?_sort=createDate&_order=";
    if (order===true){
      url+="asc";
    } else {
      url+="desc";
    }
    fetch (url)
      .then(resp => resp.json())
      .then(data => {
        let recipes = data.map((element,index) => {
        return (
        <div key={index}>
          <li>
            <Link to={`/recipes/${element.id}`}>{element.name}</Link><br/>
            <Link to={`/edit/${element.id}`}>Edit</Link>
            <button onClick={()=>delRecipe(element.id)}>Delete</button>
          </li>
        </div>)
        })
        this.setState({recipes:recipes})
    })
  }
}

class Recipe extends Component {
  constructor(props){
    super(props);
    this.state = {
      data: {}
    };
  }

  render() {
  return (
    <div>
      <p>{this.state.data.name}</p>
      <br/>
      <p>Category:  {this.state.data.category}</p>
      <br/>
      <p>{this.state.data.longDesc}</p>
      <br/>
      <Link to={`/edit/${this.state.data.id}`}>Edit</Link>
      <button onClick={()=>delRecipe(this.state.data.id)}>Delete</button>
    </div>)
  }

  componentDidMount() {
    let { recipeId } = this.props.match.params;
    let url = "http://localhost:3001/recipes/"+recipeId;
    fetch (url).then(res => res.json()).then(data=>this.setState({data:data}))
  }
}

class AddForm extends Component {
  constructor(props){
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    let req = new XMLHttpRequest()
    req.open("POST","http://localhost:3001/recipes")
    req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
    this.setState({"createDate":new Date().toLocaleDateString()})
    req.send(JSON.stringify(this.state))
    window.location.href="/"
  }

  render(){
    return (<form acceptCharset="UTF-8" onSubmit={this.handleSubmit} autoComplete="off" method="GET">
      <fieldset>
        <legend>Add:</legend>
        <label htmlFor="name">Name</label><br /> 
        <input name="name" type="text" onChange={this.handleChange} placeholder="Name" /> <br /> 
        <label htmlFor="category">Category</label><br /> 
        <input name="category" type="text" onChange={this.handleChange} placeholder="Category" /> <br />
        <label htmlFor="name">Short description</label><br /> 
        <input name="shortDesc" type="text" onChange={this.handleChange} placeholder="Write something brief" /> <br /> 
        <label htmlFor="name">Long description</label><br /> 
        <input name="longDesc" type="textarea" onChange={this.handleChange} placeholder="Provide a full-fledged description" /> <br />
        <button type="submit">Submit</button>
        </fieldset>
    </form>)
  }
  
}

class EditForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      "name":"",
      "category":"",
      "shortDesc":"",
      "longDesc":""
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault()
    let req = new XMLHttpRequest()
    req.open("PUT","http://localhost:3001/recipes"+window.location.pathname.slice(5))
    req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
    this.setState({"createDate":new Date().toLocaleDateString()})
    console.log(this.state)
    req.send(JSON.stringify(this.state))
    window.location.href = "/recipes"+window.location.pathname.slice(5)
  }

  render(){
    return (<form acceptCharset="UTF-8" onSubmit={this.handleSubmit} autoComplete="off" method="GET">
      <fieldset>
        <legend>Add:</legend>
        <label htmlFor="name">Name</label><br /> 
        <input name="name" type="text" value={this.state.name} onChange={this.handleChange} placeholder="Name" /> <br /> 
        <label htmlFor="category">Category</label><br /> 
        <input name="category" type="text" value={this.state.category} onChange={this.handleChange} placeholder="Category" /> <br />
        <label htmlFor="name">Short description</label><br /> 
        <input name="shortDesc" type="text" value={this.state.shortDesc} onChange={this.handleChange} placeholder="Write something brief" /> <br /> 
        <label htmlFor="name">Long description</label><br /> 
        <input name="longDesc" type="textarea" value={this.state.longDesc} onChange={this.handleChange} placeholder="Provide a full-fledged description" /> <br />
        <button type="submit">Submit</button>
        </fieldset>
    </form>)
  }

  componentDidMount(){
    let url = "http://localhost:3001/recipes"+window.location.pathname.slice(5)
    fetch (url)
      .then(resp => {
        console.log(resp)
        return resp.json()
      })
      .then(data => this.setState(data))
  }
  
}

function sortChange(){
  window.localStorage.setItem("asc",window.localStorage.getItem("asc")==="false");
}

function delRecipe(id){
  let req = new XMLHttpRequest()
  req.open("DELETE","http://localhost:3001/recipes/"+id)
  req.send(JSON.stringify({}))
  window.location.href="/"
}

export default App