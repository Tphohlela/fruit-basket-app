const express = require('express');
const exphbs  = require('express-handlebars');
const FruitBasket = require('./fruit-basket-service');

const app = express();
const PORT =  process.env.PORT || 3017;

const connectionString = process.env.DATABASE_URL || 'postgresql://codex:pg123@localhost:5432/fruit_app_tests';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const fruitBasket = FruitBasket(pool);

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

// console.log(exphbs);
const hbs = exphbs.create();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/', async function(req, res) {
	console.log('baasket'+ await fruitBasket.listBaskets());
	res.render('index', {
		basket: await fruitBasket.listBaskets()
	});
});

app.get('/basket/add', function(req, res) {
	res.render('basket/add');
});

app.post('/basket/add', function(req,res){
	console.log(req.body.basket_name);
	fruitBasket.createBasket(req.body.basket_name)
	res.redirect('/')
});

app.get('/basket/edit/:id', async function(req, res) {
	
	
	res.render('basket/edit',{
		basket: await fruitBasket.getBasket(req.params.id),
		fruits: await fruitBasket.listFruits(),
		basketItems: await fruitBasket.getBasketItems(req.params.id)
	});
});


app.post('/basket/update/:id', async function(req, res) {
	// console.log(req.body)
	console.log(req.body);

	await fruitBasket.addFruitToBasket(req.body.fruit_id,req.params.id,req.body.qty)

	res.redirect('/basket/edit/' + req.params.id)

	// res.render('basket/edit',{
	// 	basket: await fruitBasket.getBasket(req.params.id),
	// 	fruits: await fruitBasket.listFruits()
	// });
});

// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function() {
	console.log(`App started on port ${PORT}`)
});