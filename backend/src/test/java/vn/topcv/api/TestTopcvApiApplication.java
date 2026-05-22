package vn.topcv.api;

import org.springframework.boot.SpringApplication;

public class TestTopcvApiApplication {

	public static void main(String[] args) {
		SpringApplication.from(TopcvApiApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
