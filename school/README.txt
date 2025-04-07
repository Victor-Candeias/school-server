class_routes:
find:
	json:
		{ }
		
		{
			"level": 6,
			"class": "A"
		}
	curl:
		curl -X GET http://127.0.0.1:8001/class/find -H  "Content-Type: application/json" -d "{}"
		curl -X GET http://127.0.0.1:8001/class/find -H  "Content-Type: application/json" -d "{ \"level\": 6, \"class\": \"A\" }"

findbyid:
	json:
		{
			"id": "67e32c8bf97d9bb2e993e50d"
		}
	curl:
		curl -X GET http://127.0.0.1:8001/class/findbyid -H  "Content-Type: application/json" -d "{ \"id\": \"67e32c8bf97d9bb2e993e50d\" }"
		
add: -> adiciona uma nova class
	json:
		{
			"userid": "67e32c8bf97d9bb2e993e50d",
			"level": 6,
			"class": "A"
		}
	curl:
		curl -X POST http://127.0.0.1:8001/class/add -H  "Content-Type: application/json" -d "{ \"userid\": \"67e32c8bf97d9bb2e993e50d\", \"level\": 6, \"class\": \"A\" }"
		
levels:
	json:
	curl:
		curl -X GET http://127.0.0.1:8001/class/levels -H  "Content-Type: application/json"

*********************************************************************

students_routes: 
add: -> adiciona estudantes a uma class
	json:
	{
		"userid": "67e32c8bf97d9bb2e993e50d",
		"classid": "67e32c8bf97d9bb2e993e50d",
		"id": "1",
		"name": "nome aluno",
		"email": "aluno@ctt.pt"
	}
	curl:	
		curl -X POST http://127.0.0.1:8001/students/add -H  "Content-Type: application/json" -d "{ \"userid\": \"67e32c8bf97d9bb2e993e50d\", \"classid\": \"67e32c8bf97d9bb2e993e50d\", \"id\": \"1\", \"name\": \"nome aluno\", \"email\": \"aluno@ctt.pt\" }"

find:
	json:
	{ }
	{
		"classid": "67e32c8bf97d9bb2e993e50d"
	}
	curl:
		curl -X GET http://127.0.0.1:8001/students/find -H  "Content-Type: application/json" -d "{ }"
		curl -X GET http://127.0.0.1:8001/students/find -H  "Content-Type: application/json" -d "{\"classid\":\"67e32c8bf97d9bb2e993e50d\" }"

*********************************************************************

school_tests_router:
addtest: -> permite criar um teste com o valor de cada pergunta
	json:
	{
		"userid": "67e32c8bf97d9bb2e993e50d",
		"name": "teste 1",
		"questions": [{
				"question": "1",
				"value": "12"
			}, {
				"question": "2",
				"value": "10"
			}
		]
	}
	curl:
	curl -X POST http://127.0.0.1:8001/config/addtest -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"name\": \"teste 1\", \"questions\": [{\"question\":\"1\", \"value\": \"12\"}, {\"question\":\"2\", \"value\": \"10\"}]}"

addclasstest: -> permite associar um teste a uma class
	json:
	{
		"userid": "67e32c8bf97d9bb2e993e50d",
		"classid": "67e32c8bf97d9bb2e993e50d",
		"testid": "67e342b8f97d9bb2e993e524",
		"students": [{
				"id": "1",
				"questions": [{
						"question": "1",
						"value": "12",
						"currentvalue": "10"
					}, {
						"question": "2",
						"value": "10",
						"currentvalue": "9"
					}
				]
			}, {
				"id": "2",
				"questions": [{
						"question": "1",
						"value": "12",
						"currentvalue": "12"
					}, {
						"question": "2",
						"value": "10",
						"currentvalue": "10"
					}
				]
			}
		]
	}
	curl:
	curl -X POST http://127.0.0.1:8001/config/addclasstotest -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"students\":[{\"id\":\"1\",\"questions\":[{\"question\":\"1\",\"value\":\"12\",\"currentvalue\":\"10\"},{\"question\":\"2\",\"value\":\"10\",\"currentvalue\":\"9\"}]},{\"id\":\"2\",\"questions\":[{\"question\":\"1\",\"value\":\"12\",\"currentvalue\":\"12\"},{\"question\":\"2\",\"value\":\"10\",\"currentvalue\":\"10\"}]}]}"

findclasstest:
	json:
	{
		"userid": "67e32c8bf97d9bb2e993e50d",
		"classid": "67e32c8bf97d9bb2e993e50d",
		"testid": "67e342b8f97d9bb2e993e524",
	}
	curl:
	curl -X POST http://127.0.0.1:8001/config/addclasstotest -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"testid\":\"67e342b8f97d9bb2e993e524\"}"

addevaluationmoments: -> permite adicionar um novo momento de avaliação com as regras
	json:
	{
		"userid": "67e32c8bf97d9bb2e993e50d",
		"moments": [{
				"id": "1",
				"name": "name 1",
				"percentage": 12
			}, {
				"id": "2",
				"name": "name 2",
				"percentage": 30
			}, {
				"id": "3",
				"name": "name 3",
				"percentage": 40
			}
		]
	}
	curl:
	curl -X POST http://127.0.0.1:8001/config/addevaluationmoments -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40}]}"

findevaluationmoments:
	json:
	{
		"userid": "67e32c8bf97d9bb2e993e50d",
	}
	curl:
	curl -X POST http://127.0.0.1:8001/config/addevaluationmoments -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\"}"

addclassmoments: -> permite associar momentos de avaliação para uma class/teste/momento
	json:
	{
		"userid": "67e32c8bf97d9bb2e993e50d",
		"classid": "67e32c8bf97d9bb2e993e50d",
		"momentid": "67e34a1bf97d9bb2e993e52a",
		"students": [{
				"moments": [{
						"id": "1",
						"name": "name 1",
						"percentage": 12,
						"studentid": "1",
						"testid": "67e342b8f97d9bb2e993e524",
						"studentvalue": ""
					}, {
						"id": "2",
						"name": "name 2",
						"percentage": 30,
						"studentid": "2",
						"testid": "67e342b8f97d9bb2e993e524",
						"studentvalue": ""
					}, {
						"id": "3",
						"name": "name 3",
						"percentage": 40,
						"studentid": "3",
						"testid": "67e342b8f97d9bb2e993e524",
						"studentvalue": ""
					}
				]
			}, {
				"moments": [{
						"id": "1",
						"name": "name 1",
						"percentage": 12,
						"testid": "",
						"studentid": "1",
						"studentvalue": ""
					}, {
						"id": "2",
						"name": "name 2",
						"percentage": 30,
						"testid": "",
						"studentid": "2",
						"studentvalue": ""
					}, {
						"id": "3",
						"name": "name 3",
						"percentage": 40,
						"testid": "",
						"studentid": "3",
						"studentvalue": ""
					}
				]
			}, {
				"moments": [{
						"id": "1",
						"name": "name 1",
						"percentage": 12,
						"testid": "",
						"studentid": "1",
						"studentvalue": ""
					}, {
						"id": "2",
						"name": "name 2",
						"percentage": 30,
						"testid": "",
						"studentid": "2",
						"studentvalue": ""
					}, {
						"id": "3",
						"name": "name 3",
						"percentage": 40,
						"testid": "",
						"studentid": "3",
						"studentvalue": ""
					}
				]
			}
		]
	}
	curl:
	curl -X POST http://127.0.0.1:8001/config/addclassmoments -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"momentid\":\"67e34a1bf97d9bb2e993e52a\",\"students\":[{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"studentid\":\"1\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"studentid\":\"2\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"studentid\":\"3\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"}]},{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"testid\":\"\",\"studentid\":\"1\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"testid\":\"\",\"studentid\":\"2\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"testid\":\"\",\"studentid\":\"3\",\"studentvalue\":\"\"}]},{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"testid\":\"\",\"studentid\":\"1\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"testid\":\"\",\"studentid\":\"2\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"testid\":\"\",\"studentid\":\"3\",\"studentvalue\":\"\"}]}]}"

findclassmoments:
	json:
	{
		"userid": "67e32c8bf97d9bb2e993e50d",
		"classid": "67e32c8bf97d9bb2e993e50d",
		"momentid": "67e34a1bf97d9bb2e993e52a",
	}
	curl:
	curl -X POST http://127.0.0.1:8001/config/addclassmoments -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"momentid\":\"67e34a1bf97d9bb2e993e52a\"}"
