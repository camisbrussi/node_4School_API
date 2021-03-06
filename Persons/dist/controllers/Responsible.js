"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _dotenv = require('dotenv'); var _dotenv2 = _interopRequireDefault(_dotenv);
var _logger = require('../logger'); var _logger2 = _interopRequireDefault(_logger);

require("dotenv").config();
_dotenv2.default.config();

var _responsible = require('../models/responsible'); var _responsible2 = _interopRequireDefault(_responsible);
var _person = require('../models/person'); var _person2 = _interopRequireDefault(_person);
var _person_type = require('../models/person_type'); var _person_type2 = _interopRequireDefault(_person_type);
var _phone = require('../models/phone'); var _phone2 = _interopRequireDefault(_phone);
var _Student = require('./Student'); var _Student2 = _interopRequireDefault(_Student);

class ResponsibleController {
  async store(req, res) {
    const { userlogged, iduserlogged } = req.headers;

    try {
      const { name, cpf, email, birth_date, phones, password } = req.body;
      const type_id = process.env.RESPONSIBLE_PERSON_TYPE;

      const person = await _person2.default.create({
        type_id,
        name,
        cpf,
        email,
        birth_date,
      });
      const person_id = person.id;
      const responsible = await _responsible2.default.create(
        { person_id, password },
        { logging: console.log }
      );

      if (phones) {
        phones.map((v, k) => {
          let { number, is_whatsapp } = v;
          _phone2.default.create({ person_id, number, is_whatsapp });
        });
      }

      _logger2.default.info({
        level: "info",
        message: `Responsável id: ${name} (id: ${person_id}) registrado com sucesso`,
        label: `Registro - ${userlogged}@${iduserlogged}`,
      });

      return res.json({
        success: "Registrado com sucesso",
        responsible_id: responsible.id,
      });
    } catch (e) {
      _logger2.default.error({
        level: "error",
        message: e.errors.map((err) => err.message),
        label: `Registro - ${userlogged}@${iduserlogged}`,
      });

      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async index(req, res) {
    const { userlogged, iduserlogged } = req.headers;

    try {
      const responsibles = await _responsible2.default.findAll({
        attributes: ["id"],
        include: [
          {
            model: _person2.default,
            as: "person",
            attributes: ["id", "name", "cpf", "email", "birth_date"],
            include: [
              {
                model: _person_type2.default,
                as: "type",
                attributes: ["id", "description"],
              },
              {
                model: _phone2.default,
                as: "phones",
                attributes: ["id", "number", "is_whatsapp"],
              },
            ],
          },
        ],
        order: [[_person2.default, "name", "asc"]],
      });

      res.json(responsibles);
    } catch (e) {
      _logger2.default.error({
        level: "error",
        message: e.errors.map((err) => err.message),
        label: `Listar - ${userlogged}@${iduserlogged}`,
      });
    }
  }

  async show(req, res) {
    const { userlogged, iduserlogged } = req.headers;

    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          errors: ["Missing ID"],
        });
      }

      const responsible = await _responsible2.default.findByPk(id, {
        attributes: ["id"],
        include: [
          {
            model: _person2.default,
            as: "person",
            attributes: ["id", "name", "cpf", "email", "birth_date"],
            include: [
              {
                model: _person_type2.default,
                as: "type",
                attributes: ["id", "description"],
              },
              {
                model: _phone2.default,
                as: "phones",
                attributes: ["id", "number", "is_whatsapp"],
              },
            ],
          },
        ],
      });
      if (!responsible) {
        return res.status(400).json({
          errors: ["Responsible does not exist"],
        });
      }
      return res.json(responsible);
    } catch (e) {
      _logger2.default.error({
        level: "error",
        message: e.errors.map((err) => err.message),
        label: `Busca - ${userlogged}@${iduserlogged}`,
      });
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async update(req, res) {
    const { userlogged, iduserlogged } = req.headers;
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          errors: ["Missing ID"],
        });
      }

      const responsible = await _responsible2.default.findByPk(id);
      if (!responsible) {
        return res.status(400).json({
          errors: ["Responsible does not exist"],
        });
      }

      const person = await _person2.default.findByPk(responsible.person_id);
      if (!person) {
        return res.status(400).json({
          errors: ["Person does not exist"],
        });
      }

      const { name, cpf, email, birth_date, phones, password } = req.body;
      const newData = await person.update({ name, cpf, email, birth_date });

      if (password) {
        await responsible.update({ password });
      }

      await _phone2.default.destroy({
        where: { person_id: person.id },
      });

      if (phones) {
        await phones.map((v, k) => {
          let { number, is_whatsapp } = v;
          _phone2.default.create({ person_id: person.id, number, is_whatsapp });
        });
      }

      _logger2.default.info({
        level: "info",
        message: `Responsável id: ${person.id}, nome: ${person.name}, cpf ${person.cpf}, email ${person.email}, data nascimento ${person.birth_date} - (nome: ${newData.name}, cpf ${newData.cpf}, email ${newData.email}, data nascimento ${newData.birth_date}})`,
        label: `Edição - ${userlogged}@${iduserlogged}`,
      });

      return res.json({ success: "Editado com sucesso" });
    } catch (e) {
      _logger2.default.error({
        level: "error",
        message: e.errors.map((err) => err.message),
        label: `Edição - ${userlogged}@${iduserlogged}`,
      });
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async delete(req, res) {
    return res.json("Não é possível remover responsáveis");

    /*
        try {
            const {id} = req.params;

            if (!id) {
                return res.status(400).json({
                    errors: ["Missing ID"],
                });
            }

            const responsible = await Responsible.findByPk(id);
            if (!responsible) {
                return res.status(400).json({
                    errors: ["Responsible does not exist"],
                });
            }
            await responsible.update({status_id: process.env.});
            return res.json('Responsible inactive');
        } catch (e) {
            return res.status(400).json({
                errors: e.errors.map((err) => err.message),
            });
        }*/
  }
}

exports. default = new ResponsibleController();
