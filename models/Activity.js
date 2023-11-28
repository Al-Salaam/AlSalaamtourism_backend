const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String
    },
    shortDescription: {
        type: String
    },
    price: {
        type: Number
    },
    ratings: {
        type: Number,
        default:0
    },
    description: {
        type: String
    },
    keyInstructions: {
        type: String
    },
    reservationPolicy: {
        type: String
    },
    benifits: {
        type: String
    },
    duration: {
        type: String
    },
    cancellation: {
        type: String
    },
    groupSize: {
        type: String
    },
    languages: [
         String
    ],
    highlights: [String],
    included: [String],
    excluded: [String],
    categorey: {
        type: String,
        enum: ['activity', 'tour']
    },
    images: [{
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    }]
    ,
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            },
            name: {
                type: String
            },
            rating: {
                type: Number
            },
            comment: {
                type: String
            }
        }
    ],
    noOfReviews: {
        type: Number,
        default: 0
    },
    itemType:{
        type: String,
        default: "activity"
    },
    adults: {
        type: Number,
    },
    children: {
        type: Number,
        
    },
    infants: {
        type: Number,
    },
    slug: {
        type: String,
        // unique: true
    },

}, {
    timestamps: true
})

schema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

function slugify(text, options) {
    const separator = options && options.separator ? options.separator : '-';
    const lower = options && options.lower ? true : false;
    const textSlug = text.toString().toLowerCase()
        .replace(/\s+/g, separator)
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, separator)
        .replace(/^-+/, '')
        .replace(/-+$/, '');

    return lower ? textSlug : textSlug.charAt(0).toUpperCase() + textSlug.slice(1);
}

module.exports = mongoose.model("Activity", schema);