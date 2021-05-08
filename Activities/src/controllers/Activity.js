import dotenv from 'dotenv';
require('dotenv').config();
dotenv.config();

import Activity from '../models/activity';
import ActivityHasParticipant from '../models/activity_has_participant';
import logger from '../logger';
import Person from '../models/person';
import PersonType from '../models/person_type';
import Phone from '../models/phone';

class ActivityController {
  async store(req, res) {
    const { userlogged, iduserlogged } = req.headers;

    try {
      let erros = [];

      const {
        name,
        description,
        start,
        end,
        generate_certificate,
        vacancies,
      } = req.body;

      const status_id = 1;

      if (name.length < 3 || name.length > 50) {
        erros.push('Nome da atividade deve ter entre 3 e 50 caracteres');
      }

      var dateEnd;
      var dateStart;

      if (!start) {
        erros.push('Data de Inicio deve ser preenchida ');
      } else {
        var dateStart = new Date(start);
      }

      if (!end) {
        erros.push('Data de Fim deve ser preenchida ');
      } else {
        dateEnd = new Date(end);
      }

      if (dateStart < new Date()) {
        erros.push('Data de Inicio deve ser maior que a data atual ');
      }

      if (dateEnd < new Date()) {
        erros.push('Data de Fim deve ser maior que a atual ');
      }

      if (dateEnd < dateStart) {
        erros.push('Data de Fim deve ser maior que a Data de Início');
      }

      if (!vacancies) {
        erros.push('Número de vagas deve ser preenchido');
      }

      if (erros.length) {
        return res.json({ success: 'Erro ao registrar usuário', erros });
      } else {
        const newActivity = await Activity.create({
          name,
          description,
          start,
          end,
          generate_certificate,
          vacancies,
          status_id,
        });

        logger.info({
          level: 'info',
          message: `Atividade ${newActivity.name} (id: ${newActivity.id} registrada com sucesso)`,
          label: `Registro - ${userlogged}@${iduserlogged}`,
        });

        return res.json({ success: 'Atividade Registrada com sucesso' });
      }
    } catch (e) {
      console.log(e);
      logger.error({
        level: 'error',
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
    const activities = await Activity.findAll({
      attributes: ['id', 'name', 'start', 'end', 'status_id'],
      order: ['status_id', ['start', 'desc'], ['name', 'asc']],
    });
    res.json(activities);
  }

  async show(req, res) {
    const { userlogged, iduserlogged } = req.headers;
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          errors: ['Missing ID'],
        });
      }

      const activity = await Activity.findByPk(id);
      if (!activity) {
        return res.status(400).json({
          errors: ['Activity does not exist'],
        });
      }

      return res.json(activity);
    } catch (e) {
      logger.error({
        level: 'error',
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
      let erros = [];
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          errors: ['Missing ID'],
        });
      }

      const {
        name,
        start,
        end,
        vacancies,
      } = req.body;

      if (name.length < 3 || name.length > 50) {
        erros.push('Nome da atividade deve ter entre 3 e 50 caracteres');
      }

      var dateEnd;
      var dateStart;

      if (!start) {
        erros.push('Data de Inicio deve ser preenchida ');
      } else {
        var dateStart = new Date(start);
      }

      if (!end) {
        erros.push('Data de Fim deve ser preenchida ');
      } else {
        dateEnd = new Date(end);
      }

      if (dateStart < new Date()) {
        erros.push('Data de Inicio deve ser maior que a data atual ');
      }

      if (dateEnd < new Date()) {
        erros.push('Data de Fim deve ser maior que a atual ');
      }

      if (dateEnd < dateStart) {
        erros.push('Data de Fim deve ser maior que a Data de Início');
      }

      if (!vacancies) {
        erros.push('Número de vagas deve ser preenchido');
      }

      if (erros.length) {
        return res.json({ success: 'Erro ao registrar usuário', erros });
      } else {
        const activity = await Activity.findByPk(id);
        if (!activity) {
          return res.status(400).json({
            errors: ['Activity does not exist'],
          });
        }

        const newActivity = await activity.update(req.body);

        logger.info({
          level: 'info',
          message: `Atividade id: ${activity.id}, nome: ${activity.name}, inicio ${activity.start}, fim ${activity.end}, vagas ${activity.vacancies}, certificado ${activity.generate_certificate} - (nome: ${newActivity.name}, inicio ${newActivity.start}, fim ${newActivity.end}, vagas ${newActivity.vacancies}, certificado ${newActivity.generate_certificate})`,
          label: `Edição - ${userlogged}@${iduserlogged}`,
        });

        return res.json({ success: 'Editado com sucesso' });
      }

    } catch (e) {
      console.log(e)
      logger.error({
        level: 'error',
        message: e.errors.map((err) => err.message),
        label: `Edição - ${userlogged}@${iduserlogged}`,
      });
      
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async delete(req, res) {
    const { userlogged, iduserlogged } = req.headers;
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          errors: ['Missing ID'],
        });
      }

      const activity = await Activity.findByPk(id);
      if (!activity) {
        return res.status(400).json({
          errors: ['Atividade não existe'],
        });
      }
      await activity.update({ status_id: 2 });

      logger.info({
        level: 'info',
        message: `Atividade inativada com sucesso ${activity.name}`,
        label: `Inativação - ${userlogged}@${iduserlogged}`,
      });

      return res.json({ success: 'Atividade inativa' });
    } catch (e) {
      logger.error({
        level: 'error',
        message: e.errors.map((err) => err.message),
        label: `Inativação - ${userlogged}@${iduserlogged}`,
      });

      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async showParticipants(req, res) {
    const { userlogged, iduserlogged } = req.headers;
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          errors: ['Missing ID'],
        });
      }

      const activity = await Activity.findByPk(id);
      if (!activity) {
        return res.status(400).json({
          errors: ['Activity does not exist'],
        });
      }

      const participants = await ActivityHasParticipant.findAll({
        attributes: [
          'id',
          'registration_date',
          'number_tickets',
          'participation_date',
          'number_participation',
        ],
        include: [
          {
            model: Person,
            as: 'person',
            attributes: ['id', 'name', 'cpf', 'email', 'birth_date'],
            include: [
              {
                model: PersonType,
                as: 'type',
                attributes: ['id', 'description'],
              },
              {
                model: Phone,
                as: 'phones',
                attributes: ['id', 'number', 'is_whatsapp'],
              },
            ],
          },
        ],
        where: {
          activity_id: activity.id,
        },
        order: [[Person, 'name', 'asc']],
      });

      return res.json(participants);
    } catch (e) {
      console.log(e);
      logger.error({
        level: 'error',
        message: e.errors.map((err) => err.message),
        label: `${iduserlogged}, ${userlogged}`,
      });
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async showParticipantsTeachers(req, res) {
    const { userlogged, iduserlogged } = req.headers;
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          errors: ['Missing ID'],
        });
      }

      const activity = await Activity.findByPk(id);
      if (!activity) {
        return res.status(400).json({
          errors: ['Activity does not exist'],
        });
      }

      const participants = await ActivityHasParticipant.findAll({
        attributes: [
          'id',
          'registration_date',
          'number_tickets',
          'participation_date',
          'number_participation',
        ],
        include: [
          {
            model: Person,
            as: 'person',
            attributes: ['id', 'name', 'cpf', 'email', 'birth_date'],
            where: { type_id: process.env.TEACHER_PERSON_TYPE },
            include: [
              {
                model: PersonType,
                as: 'type',
                attributes: ['id', 'description'],
              },
              {
                model: Phone,
                as: 'phones',
                attributes: ['id', 'number', 'is_whatsapp'],
              },
            ],
          },
        ],
        where: {
          activity_id: activity.id,
        },
        order: [[Person, 'name', 'asc']],
      });

      return res.json(participants);
    } catch (e) {
      logger.error({
        level: 'error',
        message: e.errors.map((err) => err.message),
        label: `${iduserlogged}, ${userlogged}`,
      });
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async storeParticipants(req, res) {
    const { userlogged, iduserlogged } = req.headers;

    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          errors: ['Missing ID'],
        });
      }

      const { participants } = req.body;
      if (!participants.length) {
        return res.status(400).json({
          errors: ['Missing Students'],
        });
      }

      const activity = await Activity.findByPk(id);
      if (!activity) {
        return res.status(400).json({
          errors: ['Activity does not exist'],
        });
      }

      let erros = [];

      //- E agora salvamos os participantes da atividade
      for (let i = 0; i < participants.length; i++) {
        let person_id = participants[i].person.id;
        let activity_id = activity.id;
        let registration_date = new Date().toISOString().slice(0, 19);
        let number_ticktes = 1;

        //- Verifica se o participante ja esta registrado na atividade
        let registro = await ActivityHasParticipant.findAll({
          where: {
            activity_id,
            person_id,
          },
        });

        if (!registro || registro.length <= 0) {
          //- Ainda nao possui esse participante nessa atividade, entao registra
          await ActivityHasParticipant.create({
            activity_id,
            person_id,
            registration_date,
            number_ticktes,
          });
        }
      }

      //- Acho que nao precisa salvar esse tipo de log
      /*logger.info({
          level: "info",
          message: `Turma id: ${newTeam.id} nome: ${newTeam.name} registrada com sucesso`,
          label: `Registrar, ${iduserlogged}, ${userlogged}`,
      });*/

      if (erros.length)
        return res.json({
          success: 'Erro ao registrar um ou mais participantes',
          erros,
        });
      else return res.json({ success: 'Registrado com sucesso' });
    } catch (e) {
      logger.error({
        level: 'error',
        message: e.errors.map((err) => err.message),
        label: `Registrar, ${iduserlogged}, ${userlogged}`,
      });

      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async deleteSubscription(req, res) {
    const { userlogged, iduserlogged } = req.headers;
    try {
      // const {id} = req.params;
      const { subscriptionId } = req.params;

      if (!subscriptionId) {
        return res.status(400).json({
          errors: ['Missing ID'],
        });
      }

      const subscription = await ActivityHasParticipant.findByPk(
        subscriptionId
      );
      if (!subscription) {
        return res.status(400).json({
          errors: ['Inscrição não existe'],
        });
      }
      await subscription.destroy();

      logger.info({
        level: 'info',
        message: `Inscrição deletada com sucesso ${subscription.id}`,
        label: `Deletar, ${iduserlogged}, ${userlogged}`,
      });

      return res.json({ success: 'Inscrição removida' });
    } catch (e) {
      logger.error({
        level: 'error',
        message: e.errors.map((err) => err.message),
        label: `Deletar, ${iduserlogged}, ${userlogged}`,
      });

      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }
}

export default new ActivityController();
