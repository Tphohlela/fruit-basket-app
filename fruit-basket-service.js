module.exports = function(pool) {

	async function createBasket(name) {
		const result = await pool.query(`
			insert into basket (description) values ($1) returning id`, [name])
		if (result.rows) {
			return result.rows[0].id;
		}
		return null;
	}

	async function addFruitToBasket(fruitId, basketId, qty) {
		const insertFruitInBasketSQL = `insert into basket_item (basket_id, fruit_id, qty) values ($1, $2, $3)`;
		const result = await pool.query(insertFruitInBasketSQL, [basketId, fruitId, qty])
		if (result.rows.length > 0) {
			return result.rows[0];
		}
	}

	async function removeBasket(basketId) {

	}

	async function removeFruitFromBasket(fruitId, basketId) {

	}

	async function totalCostBasket(basketId){
		const selectFruitsSQL = `select  sum(qty * price) as total_cost from basket
		 join basket_item on basket_item.basket_id = basket.id 
		 join fruit on fruit.id = basket_item.fruit_id 
		 where basket.id = $1`;
		 
		const result = await pool.query(selectFruitsSQL,[basketId])
		return result.rows[0].total_cost;
	}

	async function listFruits() {
		const selectFruitsSQL = `select * from fruit order by name asc`;
		const result = await pool.query(selectFruitsSQL)
		return result.rows;
	}

	async function listBaskets() {
		const selectBasketsSQL = `select * from basket`;
		const result = await pool.query(selectBasketsSQL)
		const results = result.rows;

		const resultWithTotalCost = [];
		
		for(const basket of results){
			const total = await totalCostBasket(basket.id)
			if(total){
			basket.total = total
			}
			else{
			basket.total = '0.00'
			}
			resultWithTotalCost.push(basket)
		}
		return resultWithTotalCost;
	}

	async function getBasket(basketId) {
		const selectBasketByIdSQL = `select * from basket where id = $1`;
		const result = await pool.query(selectBasketByIdSQL, [basketId])
		if (result.rows.length > 0) {
			return result.rows[0];
		}
	}

	async function getBasketItems(basketId) {
		const selectBasketItemsSQL = `select *, qty * price as total_price 
			from basket_item 
				join fruit on fruit.id = basket_item.fruit_id
			where basket_id = $1`;
		const result = await pool.query(selectBasketItemsSQL, [basketId])
		if (result.rowCount > 0) {
			return result.rows;
		}
	}

	return {
		addFruitToBasket,
		createBasket,
		getBasket,
		listBaskets,
		getBasketItems,
		listFruits,
		totalCostBasket
	}
}