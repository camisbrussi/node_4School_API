import dotenv from "dotenv";

require('dotenv').config();
dotenv.config();

import Teacher from "../models/teacher";
import TeacherStatus from "../models/teacher_status";
import Person from "../models/person";
import PersonType from "../models/person_type";

class TeacherController {
    async store(req, res) {
        try {
            const {name, cpf, email, birth_date} = req.body;
            const type_id = process.env.TEACHER_PERSON_TYPE;
            const status_id = process.env.TEACHER_STATUS_ACTIVE;

            const person = await Person.create({type_id, name, cpf, email, birth_date});
            const person_id = person.id;
            await Teacher.create({person_id, status_id});

            return res.json({success: 'Registrado com sucesso'});
        } catch (e) {
            console.log(e)
            return res.status(400).json({
                errors: e.errors.map((err) => err.message),
            });
        }
    }

    async index(req, res) {
        try {
            const teachers = await Teacher.findAll({
                attributes: ["id"],
                include: [
                    {
                        model: Person,
                        as: "person",
                        attributes: ["id", "name", "cpf", "email", "birth_date"],
                        include: {
                            model:PersonType,
                            as: "type",
                            attributes: ["id","description"]
                        }
                    },{
                        model: TeacherStatus,
                        as: "status",
                        attributes: ["id", "description"]
                    }
                ],
                order: [
                    "status_id",
                    [Person, "name", "asc"]
                ]
            });

            res.json(teachers);
        } catch (e) {
            console.log(e);
        }
    }

    async show(req, res) {
        try {
            const {id} = req.params;
            if (!id) {
                return res.status(400).json({
                    errors: ["Missing ID"],
                });
            }

            const teacher = await Teacher.findByPk(id, {
                attributes: ["id"],
                include: [
                    {
                        model: Person,
                        as: "person",
                        attributes: ["id", "name", "cpf", "email", "birth_date"],
                        include: {
                            model:PersonType,
                            as: "type",
                            attributes: ["id","description"]
                        }
                    },{
                        model: TeacherStatus,
                        as: "status",
                        attributes: ["id", "description"]
                    }
                ]
            });
            if (!teacher) {
                return res.status(400).json({
                    errors: ["Teacher does not exist"],
                });
            }
            return res.json(teacher);
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                errors: e.errors.map((err) => err.message),
            });
        }
    }

    async update(req, res) {
        try {
            const {id} = req.params;

            if (!id) {
                return res.status(400).json({
                    errors: ["Missing ID"],
                });
            }

            const teacher = await Teacher.findByPk(id);
            if (!teacher) {
                return res.status(400).json({
                    errors: ["Teacher does not exist"]
                });
            }

            const person = await Person.findByPk(teacher.person_id);
            if (!person) {
                return res.status(400).json({
                    errors: ["Person does not exist"]
                });
            }

            const {status_id, name, cpf, email, birth_date} = req.body;
            if (status_id) {
                await teacher.update({status_id});
            }
            await person.update({name, cpf, email, birth_date});

            return res.json({success: 'Editado com sucesso'});
        } catch (e) {
            console.log(e)
            return res.status(400).json({
                errors: e.errors.map((err) => err.message),
            });
        }
    }

    async delete(req, res) {
        try {
            const {id} = req.params;

            if (!id) {
                return res.status(400).json({
                    errors: ["Missing ID"],
                });
            }

            const teacher = await Teacher.findByPk(id);
            if (!teacher) {
                return res.status(400).json({
                    errors: ["Teacher does not exist"],
                });
            }
            await teacher.update({status_id: process.env.TEACHER_STATUS_INACTIVE});
            return res.json('Teacher inactive');
        } catch (e) {
            return res.status(400).json({
                errors: e.errors.map((err) => err.message),
            });
        }
    }
}

export default new TeacherController();