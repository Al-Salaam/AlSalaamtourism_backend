const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    heading: {
        type: String,
    },
    description: {
        type: String
    },
    keyInstructions: {
        type: String
    },
    cancellationguide: {
        type: String
    },
    childpolicy: {
        type: String
    },
    tourbenifits: {
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
    languages: [String]
    ,
    ratings: {
        type: Number
    },
    images: [{
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    }],
    dayDeals:[
        {
            heading:{
                type: String,
            },
            description:{
                type: String,
            }
        }
    ],
    nigthDeals:[
        {
            heading:{
                type: String,
            },
            description:{
                type: String,
            }
        }
    ],
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
    itemType: {
        type: String,
        default: "package"
    },
    slug: {
        type: String,
        unique: true
    },
}, {
    timestamps: true
})

schema.pre('save', function (next) {
    this.slug = slugify(this.heading, { lower: true });
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

module.exports = mongoose.model('Pakage', schema)