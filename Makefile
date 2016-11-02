test:
	@docker run -v `pwd`:/src/ singapore/lint-condo:0.3.3

build:
	@docker build -t singapore/home-inspector .
