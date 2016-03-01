/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import com.google.gson.Gson;
import net.stigmod.domain.info.ModelingOperationLog;
import net.stigmod.domain.info.ModelingResponse;
import net.stigmod.domain.node.ClassNode;
import net.stigmod.domain.node.ValueNode;
import net.stigmod.domain.relationship.ClassToValueEdge;
import net.stigmod.repository.node.ClassNodeRepository;
import net.stigmod.repository.node.ValueNodeRepository;
import net.stigmod.repository.relationship.ClassToVEdgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.template.Neo4jOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @author Shijun Wang
 * @version 2016/2/27
 */
@Service
public class WorkspaceService {

    @Autowired
    private Neo4jOperations neo4jTemplate;

    @Autowired
    private ClassNodeRepository classNodeRepository;

    @Autowired
    private ValueNodeRepository valueNodeRepository;

    @Autowired
    private ClassToVEdgeRepository classToVEdgeRepository;

    @Transactional
    public void testNeo4jSaving(Long icmId, Long ccmId) {
        ClassNode clazz = new ClassNode();
        ValueNode value = new ValueNode();
        ClassToValueEdge c2vEdge = new ClassToValueEdge("1", "name", clazz, value);
        clazz.addC2VEdge(c2vEdge);
        value.addC2VEdge(c2vEdge);

        neo4jTemplate.save(clazz);
    }

    @Transactional
    public ModelingResponse modelingOperationSync(String molJsonString) {
        ModelingOperationLog mol = constructMOL(molJsonString);
        ModelingResponse modelingResponse = executeMOL(mol);
        System.out.println(modelingResponse.toString());

        return modelingResponse;
    }

    /**
     * 将 JSON 字符串转换为 ModelingOperationLog 对象
     * @param molJsonString 字符串形式的 LOG
     * @return 对象形式的 LOG
     */
    public ModelingOperationLog constructMOL(String molJsonString) {
        Gson gson = new Gson();
        return gson.fromJson(molJsonString, ModelingOperationLog.class);
    }

    /**
     * 执行建模操作日志
     * @param mol 前端传回来的操作日志
     */
    public ModelingResponse executeMOL(ModelingOperationLog mol) {
        List<List<String>> ops = mol.log;
        Long ccmId = mol.ccmId;
        Long icmId = mol.icmId;
        ModelingResponse modelingResponse = new ModelingResponse();

        for (List<String> op : ops) {
            executeOP(op, ccmId, icmId, modelingResponse);
        }

        return modelingResponse;
    }

    /**
     * 执行单条操作
     *
     * -- 日志条目的格式：
     *
     * - 增加
     * ADD CLS class classCCMId addingType (fresh, binding)
     * ADD RLG relationGroup
     * ADD ATT class attribute attributeCCMId addingType (fresh, binding)
     * ADD RLT relationGroup relation relationCCMId addingType (fresh, binding)
     * ADD POA class attribute property value
     * ADD POR relationGroup relation property value
     *
     * - 修改key
     * MOD CLS classOld classNew
     * MOD RLG relationGroupOld relationGroupNew
     * MOD ATT class attributeOld attributeNew
     * // MOD RLT relationGroup relationOld relationNew
     *
     * - 修改value
     * MOD POA class attribute property value
     * MOD POR relationGroup relation property value
     *
     * - 删除
     * RMV CLS class
     * RMV RLG relationGroup
     * RMV ATT class attribute
     * RMV RLT relationGroup relation
     * RMV POA class attribute property
     * RMV POR relationGroup relation property
     *
     * - 插入order元素
     * ODI ATT class attribute position direction
     * ODI RLT relationGroup relation position direction
     *
     * - 修改order元素名称
     * ODE ATT class attributeOld attributeNew
     * // ODE RLT relationGroup relationOld relationNew
     *
     * - 删除order元素
     * ODR ATT class attribute
     * ODR RLT relationGroup relation
     *
     * - 移动order元素
     * ODM ATT class attribute position direction
     * ODM RLT relationGroup relation position direction
     *
     * @param op 一条操作
     */
    @Transactional
    public void executeOP(List<String> op, Long ccmId, Long icmId, ModelingResponse modelingResponse) {

        // 注意，op 的第一个元素是 Date
        if (op.get(1).equals("ADD")) {
            if (op.get(2).equals("CLS")) {  // add class

                String className = op.get(3);
                List<ValueNode> valueNodes = valueNodeRepository.findByNameAndCcmId(className, ccmId);
                boolean valueNodeExists = !valueNodes.isEmpty();
                boolean classNodeExists = !op.get(5).equals("fresh");

                // 获取 value node
                ValueNode valueNode = valueNodeExists ? valueNodes.get(0) : new ValueNode(ccmId, icmId, className);

                // 获取 class node
                ClassNode classNode = classNodeExists ? classNodeRepository.findOne(Long.parseLong(op.get(4), 10)) : new ClassNode(ccmId, icmId);

                // 获取 c2v edge
                ClassToValueEdge c2vEdge = null;
                List<ClassToValueEdge> c2vEdges = null;
                if (classNodeExists && valueNodeExists) {
                    c2vEdges = classToVEdgeRepository.findByClassIdAndValueId(classNode.getId(), valueNode.getId());
                    if (!c2vEdges.isEmpty()) {
                        c2vEdge = c2vEdges.get(0);  // CCM 中已存在此边
                        c2vEdge.addIcmId(icmId);
                    }
                }
                if (!classNodeExists || !valueNodeExists || c2vEdges.isEmpty()) {  // CCM 中未存在此边
                    c2vEdge = new ClassToValueEdge(ccmId, icmId, "name", classNode, valueNode);
                    classNode.addC2VEdge(c2vEdge);
                    valueNode.addC2VEdge(c2vEdge);
                }

                // 保存
                neo4jTemplate.save(c2vEdge);

                // 更新 id 映射和返回信息
                if (!classNodeExists) {
                    modelingResponse.addIdMapping(op.get(4), classNode.getId());
                }
                modelingResponse.addMessage("Add class [" + className + "] finished.");


            } else if (op.get(2).equals("RLG")) {  // add relation group
                // DO NOTHING

            } else if (op.get(2).equals("ATT")) {  // add attribute

            } else if (op.get(2).equals("RLT")) {  // add relationship

            } else if (op.get(2).equals("POA")) {  // add property of attribute

            } else if (op.get(2).equals("POR")) {  // add property of relationship

            } else {
                // NOT ALLOWED
            }
        } else {
            // DO NOTHING
        }
    }
}
