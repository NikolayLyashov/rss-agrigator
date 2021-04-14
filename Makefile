install:
	npm install

lint:
	npx eslint .

test-coverage:
	npm run test -- --coverage

build:
	npm run build