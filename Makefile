install:
	npm install

lint:
	npx eslint .

test:
	npm run test

test-coverage:
	npm run test -- --coverage

build:
	npm rub build