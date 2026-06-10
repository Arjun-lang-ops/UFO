import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant"
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    price: {
        type: Number,
        required: true
    },

    totalPrice: {
        type: Number,
        required: true
    },
     // RETURN DETAILS
    returnRequest: {
      type: Boolean,
      default: false,
    },

    returnQuantity: {
      type: Number,
      default: 0,
    },

    returnReason: {
      type: String,
      default:''
    },

    returnDescription: {
      type: String,
      trim: true,
      default: "",
    },

    returnStatus: {
      type: String,
      default: 'Pending',
    },
    

    requestedAt:{
        type:Date,
        default:Date.now
    },


    returnedAt:{
        type:Date,
        default:Date.now
    },

    adminReturnRemark: {
      type: String,
      default: "",
    },
    cancelRequest: {
    type: Boolean,
    default: false
  },

  cancelQuantity: {
    type: Number,
    default: 0
  },

  cancelReason: {
    type: String,
    default: ""
  },

  cancelDescription: {
    type: String,
    trim: true,
    default: ""
  },

  cancelStatus: {
    type: String,
    enum: [
      "Pending",
      "Approved",
      "Rejected",
      "Cancelled",
      "Refunded"
    ],
    default: "Pending"
  },

  cancelledAt: {
    type: Date
  },

  refundAmount: {
    type: Number,
    default: 0
  },


}, {
    _id: true
});

const orderSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [orderItemSchema],

    address: {
        fullname: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        country: {
            type: String,
            required: true
        },

        state: {
            type: String,
            required: true
        },

        street: {
            type: String,
            required: true
        },

        apartment: {
            type: String
        },

        pincode: {
            type: String,
            required: true
        }
    },

    paymentMethod: {
        type: String,
        enum: ["COD", "RAZORPAY", "WALLET"],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending"
    },

    orderStatus: {
        type: String,
        enum: [
            "Pending",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled",
            "Returned"
        ],
        default: "Pending"
    },

    orderNumber:{
        type:String,
        required:true,
        unique :true
    },

    subTotal: {
        type: Number,
        required: true
    },

    discount: {
        type: Number,
        default: 0
    },

    deliveryCharge: {
        type: Number,
        default: 0
    },

    totalAmount: {
        type: Number,
        required: true
    },

    couponCode: {
        type: String
    },
    
    estimatedDelivery:{
        type:String,
        required:true
    },

    razorpayOrderId: {
        type: String
    },

    orderedAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
