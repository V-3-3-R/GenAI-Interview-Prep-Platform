const mongoose = require('mongoose')

const blacklistTokenSchema = new mongoose.Schema(
    {
        // Object 1: Fields definition
        token: {
            type: String,
            required: [true, "Token is required to be added in blacklist"]
        }
    },
    {
        // Object 2: Options configuration
        timestamps: true
    }
)

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)

module.exports = tokenBlacklistModel
