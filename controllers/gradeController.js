import { gradeModel } from '../models/index.js';
import { logger } from '../config/logger.js';
import { promises } from 'fs';

const readFile = promises.readFile;

const insertDefault = async (req, res) => {
	try {
		await gradeModel.deleteMany({});

		let data = await readFile('grades.json', 'utf8');
		let grades = JSON.parse(data);

		for (let i in grades) {
			const grade = new gradeModel(grades[i]);
			await grade.save();
		}

		return res.status(200).send({ success: 'API redefinida com sucesso.' });
	} catch (error) {
		logger.error(`POST /grade - ${JSON.stringify(error.message)}`);
		return res.status(500).send({ message: error.message || 'Erro ao redefinir registros.' });
	}
};

const create = async (req, res) => {
	let { name, subject, type, value } = req.body;

	if (!name || !subject || !type) {
		return res.status(400).send({ error: 'Obrigatório parâmetros "name", "subject" e "type".' });
	}

	value = parseFloat(value);

	if (value < 0) {
		return res.status(400).send({ error: 'Parâmetro "value" inválido.' });
	}

	try {
		const grade = new gradeModel({
			name,
			subject,
			type,
			value
		});

		await grade.save();

		logger.info(`POST /grade - ${JSON.stringify(grade)}`);
		return res.status(200).send(grade);
	} catch (error) {
		logger.error(`POST /grade - ${JSON.stringify(error.message)}`);
		return res.status(500).send({ message: error.message || 'Algum erro ocorreu ao salvar.' });
	}
};

const findAll = async (req, res) => {
	const nome = req.query.name;

	if (nome && typeof nome !== 'string') {
		return res.status(400).send({ error: 'Parâmetro "name" precisa ser do tipo "string".' });
	}

	//condicao para o filtro no findAll
	var condition = nome ? { name: { $regex: new RegExp(nome), $options: 'i' } } : {};

	try {
		let grades = await gradeModel.find(condition);

		for (let i in grades) {
			const { _id, name, subject, type, value } = grades[i];
			grades[i] = { id: _id, name, subject, type, value };
		}

		logger.info(`GET /grade`);
		return res.send(grades);
	} catch (error) {
		logger.error(`GET /grade - ${JSON.stringify(error.message)}`);
		return res.status(500).send({ message: error.message || 'Erro ao listar todos os documentos.' });
	}
};

const findOne = async (req, res) => {
	const id = req.params.id;

	if (!id || typeof id !== 'string') {
		return res.status(400).send({ error: 'Parâmetro "id" precisa ser do tipo "string".' });
	}

	try {
		let grade = await gradeModel.findOne({ _id: id });

		if (!grade) {
			return res.status(400).send({ message: 'Grade não encontrada.' });
		}

		const { name, subject, type, value } = grade;
		grade = { id: grade._id, name, type, subject, value };

		console.log(grade);
		logger.info(`GET /grade - ${id}`);
		return res.status(200).send(grade);
	} catch (error) {
		logger.error(`GET /grade - ${JSON.stringify(error.message)}`);
		return res.status(500).send({ message: `Erro ao buscar a Grade de ID: ${id}.` });
	}
};

const update = async (req, res) => {
	if (!req.body) {
		return res.status(400).send({
			message: 'Informe os dados para atualização.'
		});
	}

	const { id } = req.params;

	if (!id || typeof id !== 'string') {
		return res.status(400).send({ error: 'É obrigatório o parâmetro "id" (tipo "string").' });
	}

	try {
		const obj = req.body;
		const grade = await gradeModel.findOneAndUpdate(
			{
				_id: id
			},
			{
				$set: obj
			},
			{ useFindAndModify: false }
		);

		if (!grade) {
			return res.status(400).send({ message: 'Grade não encontrado.' });
		}

		logger.info(`PUT /grade - ${id} - ${JSON.stringify(req.body)}`);
		return res.send({ message: 'Grade atualizada com sucesso.' });
	} catch (error) {
		logger.error(`PUT /grade - ${JSON.stringify(error.message)}`);
		return res.status(500).send({ message: `Erro ao atualizar a Grade de ID: ${id}.` });
	}
};

const remove = async (req, res) => {
	const id = req.params.id;

	if (!id || typeof id !== 'string') {
		return res.status(400).send({ error: 'É obrigatório o parâmetro "id" (tipo "string").' });
	}

	try {
		const deletedGrade = await gradeModel.findOneAndDelete({
			_id: id
		});

		if (!deletedGrade) {
			return res.status(400).send({ message: 'Grade não encontrada.' });
		}

		logger.info(`DELETE /grade - ${id}`);
		return res.send({ message: 'Grade excluida com sucesso.' });
	} catch (error) {
		logger.error(`DELETE /grade - ${JSON.stringify(error.message)}`);
		return res.status(500).send({ message: `Não foi possivel deletar a Grade de ID: ${id}.` });
	}
};

const removeAll = async (req, res) => {
	try {
		await gradeModel.deleteMany({});

		logger.info(`DELETE /grade`);
		return res.send({ message: `Grades excluidas com sucesso.` });
	} catch (error) {
		res.status(500).send({ message: 'Erro ao excluir todos as Grades' });
		logger.error(`DELETE /grade - ${JSON.stringify(error.message)}`);
	}
};

export default { insertDefault, create, findAll, findOne, update, remove, removeAll };
