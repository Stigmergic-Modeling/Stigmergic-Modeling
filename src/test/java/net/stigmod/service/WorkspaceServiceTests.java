/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import net.stigmod.domain.info.ModelingOperationLog;
import static junit.framework.TestCase.assertEquals;

import net.stigmod.domain.info.ModelingResponse;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Shijun Wang
 * @version 2016/2/29
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(locations = {"classpath*:/../applicationContext.xml"})
public class WorkspaceServiceTests {

    @Autowired
    private WorkspaceService ws;

    @Test
    public void json2molConversion() {
////        String json0 = "{\"date\":1456756617481,\"user\":\"WangShijun\",\"icmId\":110,\"icmName\":\"7OK\",\"log\":[[1456756614136,\"ADD\",\"ATT\",\"Course\",\"hao\",\"56d457861ce21c393c68f2c3\",\"fresh\"],[1456756614138,\"ODI\",\"ATT\",\"Course\",\"hao\",\"@\",0],[1456756614140,\"ADD\",\"POA\",\"Course\",\"hao\",\"name\",\"hao\"],[1456756614141,\"ADD\",\"POA\",\"Course\",\"hao\",\"type\",\"int\"]],\"orderChanges\":{\"classes\":{\"Course\":[\"name\",\"code\",\"credit\",\"hao\"]},\"relationGroups\":{}}}";
//        String json0 = "{\"date\":1456756617481,\"user\":\"WangShijun\",\"ccmId\":117,\"icmId\":118,\"icmName\":\"1111111\",\"log\":[[1456761672324,\"ODM\",\"ATT\",\"Course\",\"name\",1],[1456761680297,\"ADD\",\"ATT\",\"Course\",\"hao\",\"56d46b501ce21cae886fed11\",\"fresh\"],[1456761680298,\"ODI\",\"ATT\",\"Course\",\"hao\",\"@\",0],[1456761680300,\"ADD\",\"POA\",\"Course\",\"hao\",\"name\",\"hao\"],[1456761680302,\"ADD\",\"POA\",\"Course\",\"hao\",\"type\",\"int\"],[1456761698999,\"ADD\",\"POR\",\"Course-Department\",12,\"ordering\",\"True-True\"],[1456761709129,\"MOD\",\"POR\",\"Course-Department\",12,\"multiplicity\",\"*-2\"]],\"orderChanges\":{\"classes\":{\"Course\":[\"code\",\"name\",\"credit\",\"hao\"]},\"relationGroups\":{}}}";
//        ModelingOperationLog mol0 = ws.constructMOL(json0);
//
//        assertEquals("date", 1456756617481L, (long)mol0.date);
//        assertEquals("user", "WangShijun", mol0.user);
    }

    @Test
    public void executeOPTest() {
//        List<String> op = new ArrayList<>();
//        op.add("ADD");
//        op.add("CLS");
//        op.add("Course");
//        op.add("56d457861ce21c393c68f2c3");
//        op.add("fresh");
//        Long ccmId = 117L;
//        Long icmId = 118L;
//        ModelingResponse mr = new ModelingResponse();
//        ws.executeOP(op, ccmId, icmId, mr);
//        System.out.println(mr.toString());
    }
}
