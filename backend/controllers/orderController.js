import asyncHandler from 'express-async-handler'
import Order from '../models/orderModel.js'
import User from '../models/userModel.js'
import nodemailer from 'nodemailer'
import Product from '../models/productModel.js'


// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body

  if (orderItems && orderItems.length === 0) {
    res.status(400)
    throw new Error('No order items')
    return
  } 
  else {
    for (let item of orderItems) {
        let ordProduct = await Product.findById(item.product)
        if (ordProduct) {
          ordProduct.countInStock = ordProduct.countInStock - item.qty
          let updatedProduct = await ordProduct.save()
          if(updatedProduct){
            console.log(updatedProduct)
          }
        }
    }
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    })
    const createdOrder = await order.save()
    if(createdOrder){
      const user = await User.findById(createdOrder.user)
      async function main() {
          // create reusable transporter object using the default SMTP transport
          let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAILER_USER, // generated ethereal user
                pass: process.env.MAILER_PASS, // generated ethereal password
            },
          });
              
          // send mail with defined transport object
          let info = await transporter.sendMail({
            from: '🛒"supakart" <pshouvickd97@gmail.com>', // sender address
            to: `${user.email}`, // list of receivers
            subject: "Order Confirmed", // Subject line
            html: `<h5>Hi ${user.name} Your order has been Confirmed</h5>
            <h3>Order ID : ${createdOrder._Id}</h4>
            <hr/>
            <h5>Item Details</h5>
            <table>
              <tr><th>Item name</th><th>Quantity x Price</th><th>Subtotal</th></tr>
            </table>
            <hr/>
            <h5>your order will be delivered within  ${createdOrder.createdAt}<h5>`, // html body
          });
          if(info.messageId){
            console.log("Message sent: %s", info.messageId);
          }
          // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
          else{
            console.log("Message Jaini:");
          }
        }  
      main().catch(console.error);
    }
    res.status(201).json(createdOrder)
  }
})

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  )

  if (order) {
    res.json(order)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

// @desc    Update order to paid
// @route   GET /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    }

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

// @desc    Update order to processing
// @route   GET /api/orders/:id/orderProcessing
// @access  Private/Admin
const updateOrderToProcessing = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {

    order.isProcessingForDelivary = true

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } 
  else {
    res.status(404)
    throw new Error('Order not found')
  }
})

// @desc    Update order to outForDelivary
// @route   GET /api/orders/:id/outForDelivary
// @access  Private/Admin
const updateOrderToOutForDelivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {

    order.isOutForDelivary = true

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } 
  else {
    res.status(404)
    throw new Error('Order not found')
  }
})

// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {

    if(order.paymentMethod === 'COD'){
      order.isPaid = true
      order.paidAt = Date.now()
    }

    order.isDelivered = true
    order.deliveredAt = Date.now()

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } 
  else {
    res.status(404)
    throw new Error('Order not found')
  }
})

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
  res.json(orders)
})

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name')
  res.json(orders)
})

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToProcessing,
  updateOrderToOutForDelivery,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
}
