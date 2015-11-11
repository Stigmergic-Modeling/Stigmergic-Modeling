package net.stigmod.domain;


import net.stigmod.domain.node.IndividualConceptualModel;
import org.junit.Test;
import static junit.framework.TestCase.assertEquals;
import com.google.gson.Gson;

public class IndividualConceptualModelTests {

    private IndividualConceptualModel modelInfo = new IndividualConceptualModel();
    private Gson gson = new Gson();

    @Test
    public void toJson() throws Exception {
        String json = gson.toJson(this.modelInfo);
        assertEquals("json ok",
                json,
                "{\"data1\":100,\"data2\":\"hello\",\"list\":[\"String 1\",\"String 2\",\"String 3\"]}");
    }
}
