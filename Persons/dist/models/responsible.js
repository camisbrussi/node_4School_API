"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _person = require('./person'); var _person2 = _interopRequireDefault(_person);
var _bcryptjs = require('bcryptjs'); var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

 class responsible extends _sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                password_hash: {
                    type: _sequelize2.default.STRING(80),
                    defaultValue: ""
                },
                password: {
                    type: _sequelize2.default.VIRTUAL,
                    defaultValue: "",
                    validate: {
                        len: {
                            args: [6, 50],
                            msg: "Password must be between 6 and 50 characters",
                        },
                    },
                }
            },
            {
                sequelize,
                freezeTableName: true
            }
        );
        this.addHook("beforeSave", async (responsible) => {
            if (responsible.password) {
                responsible.password_hash = await _bcryptjs2.default.hash(responsible.password, 8);
            }
        });
        return this;
    }

    passwordIsValid(password) {
        return _bcryptjs2.default.compare(password, this.password_hash);
    }

    static associate(models) {
        this.belongsTo(models.person, {foreignKey:"person_id", as:"person"});
        this.hasMany(models.student, {foreignKey:"responsible_id", as:"student"})
    }
} exports.default = responsible; 