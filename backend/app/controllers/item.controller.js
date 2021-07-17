const db = require("../models");
const Item = db.items;
const Category = db.categories;
const category_controller = require("../controllers/category.controller");

// Create and Save a newItem
exports.create = (req, res) => {
    // Validate request
    if (!req.body.name) {
      res.status(400).send({ message: "Content can not be empty!" });
      return;
    }
  
    // Create a Item
    const item = new Item({
      name: req.body.name,
      price: req.body.price,
      categories: req.body.categories,
      on_stock: req.body.on_stock,
      photo: req.body.photo
    });
  
    // Save Item in the database
    item
      .save(item)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Item."
        });
      });

    for (category of item.categories){
      console.log(category);
      db.categories.find({name:category})
      .then(data=>{
        if(data.length==0)
          category_controller.add_new_category(category, [], null, res);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while adding category for item."
        });
      });
    }
  };


// Retrieve all Items from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};
  
    Item.find(condition)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving items."
        });
      });
  };

// Find a single Item with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Item.findById(id)
      .then(data => {
        if (!data)
          res.status(404).send({ message: "Not found Item with id " + id });
        else res.send(data);
      })
      .catch(err => {
        res
          .status(500)
          .send({ message: "Error retrieving Item with id=" + id });
      });
  };

// Update a Item by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
    }

    const id = req.params.id;

    Item.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot update Item with id=${id}. Maybe Item was not found!`
          });
        } else res.send({ message: "Item was updated successfully." });
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Item with id=" + id
        });
      });
  };

// Delete a Item with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    Item.findByIdAndRemove(id)
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot delete Item with id=${id}. Maybe Item was not found!`
          });
        } else {
          res.send({
            message: "Item was deleted successfully!"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Item with id=" + id
        });
      });
  };

// Delete all Items from the database.
exports.deleteAll = (req, res) => {
    Item.deleteMany({})
      .then(data => {
        res.send({
          message: `${data.deletedCount} Items were deleted successfully!`
        });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all items."
        });
      });
  };

// Find all published Items
exports.findAllPublished = (req, res) => {
    Item.find({ published: true })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving items."
        });
      });
  };

  exports.getAllCategoryItems = async (req, res) => {
    let category = req.body.category;
    console.log(category);
    let data = await Category.findOne({name: category})
    console.log(data)
    acceptedCategories = getAllSubcategories(data.name)
    console.log("[accepted categories before resolving]")
    console.log(acceptedCategories)
    let accepted = await acceptedCategories
    console.log("[accepted categories after resolving]")
    console.log(accepted);
    let data2 = await Item.find({categories: {$in: accepted}})
    res.send(data2);
  }


  async function getAllSubcategories(category, res=[]){
    // console.log(category)
    cat = await getCategory(category)
    // console.log(category)
    if(!cat.sub_categories.length){
      res.push(cat.name)
      // console.log(cat)
      return res
    }else{
      for(sub of cat.sub_categories){
        res = await getAllSubcategories(sub, res)
      }
      console.log("res")
      console.log(res)
      return res
    }
  }

  function getCategory(name){
    return Category.findOne({name: name})
  }

