/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service.migrateService;

import net.stigmod.domain.conceptualmodel.ClassNode;
import net.stigmod.domain.conceptualmodel.RelationNode;
import net.stigmod.domain.conceptualmodel.ValueNode;
import net.stigmod.domain.conceptualmodel.Vertex;
import net.stigmod.repository.node.ClassNodeRepository;
import net.stigmod.repository.node.RelationNodeRepository;
import net.stigmod.repository.node.ValueNodeRepository;
import net.stigmod.repository.node.VertexRepository;
import net.stigmod.util.WordSimilarities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * @author Kai Fu
 * @version 2016/3/18
 */
@Service
public class MigrateServiceImpl implements MigrateService{

    @Autowired
    private VertexRepository vertexRepository;

    @Autowired
    private ClassNodeRepository classNodeRepository;

    @Autowired
    private RelationNodeRepository relationNodeRepository;

    @Autowired
    private ValueNodeRepository valueNodeRepository;

    @Autowired
    private MigrateHandler migrateHandler;

    private List<ClassNode> classNodeList;

    private List<RelationNode> relationNodeList;

    private List<ValueNode> valueNodeList;

    private Long modelId;

    boolean isRunning = false;

    public boolean migrateAlgorithmImpls(Long modelId,String path) {
        if(!isRunning) {
            isRunning = true;
            migrateDataInit(modelId,path);
            migrateDeal();
            migrateDataStore();
            isRunning = false;
            return true;
        }else {
            return false;//表示没有执行该算法
        }
    }

    private void migrateDataInit(Long modelId,String path) {//path默认为"/Users/fukai/Desktop/wordnet"
        //获取ccm中各种node的数据
        this.modelId = modelId;

        classNodeList = new ArrayList<>();
        relationNodeList = new ArrayList<>();
        valueNodeList = new ArrayList<>();

        initConvertList();//初始化了classNodeList,relationNodeList以及valueNodeList

        WordSimilarities.initWuAndPalmer(path);
        setLocForList();
        WordSimilarities.vNodeSimList.clear();//先清空一下
        WordSimilarities.getVNodeSimListByName(valueNodeList);//必须先setLocForList在进行该函数

        migrateHandler.migrateInit(modelId,classNodeList,relationNodeList,valueNodeList);
    }

    private void migrateDeal() {
        migrateHandler.migrateHandler();
    }

    private void migrateDataStore() {
        for(int i=0;i<classNodeList.size();i++) classNodeRepository.save(classNodeList.get(i),1);
        for(int i=0;i<relationNodeList.size();i++) relationNodeRepository.save(relationNodeList.get(i),1);
        for(int i=0;i<valueNodeList.size();i++) valueNodeRepository.save(valueNodeList.get(i),1);
        System.out.println("算法运行结束!");

        this.classNodeList.clear();
        this.relationNodeList.clear();
        this.valueNodeList.clear();
    }

    private void initConvertList() {
        List<Long> cIdList = convertDetail(vertexRepository.getAllByCcmIdAndLabel(modelId,"Class"));
        List<Long> rIdList = convertDetail(vertexRepository.getAllByCcmIdAndLabel(modelId,"Relationship"));
        List<Long> vIdList = convertDetail(vertexRepository.getAllByCcmIdAndLabel(modelId,"Value"));

        Iterable<ClassNode> cNodeIter = classNodeRepository.findAll(cIdList,1);
        Iterable<RelationNode> rNodeIter = relationNodeRepository.findAll(rIdList,1);
        Iterable<ValueNode> vNodeIter = valueNodeRepository.findAll(vIdList,1);

        Iterator<ClassNode> cIter = cNodeIter.iterator();
        Iterator<RelationNode> rIter = rNodeIter.iterator();
        Iterator<ValueNode> vIter = vNodeIter.iterator();

        while(cIter.hasNext()) {
            classNodeList.add(cIter.next());
        }
        while(rIter.hasNext()) relationNodeList.add(rIter.next());
        while(vIter.hasNext()) valueNodeList.add(vIter.next());
    }

    private List<Long> convertDetail(List<Vertex> list) {
        List<Long> newList = new ArrayList<>();
        for(Vertex vertex : list) {
            newList.add(vertex.getId());
        }
        return newList;
    }

    private void setLocForList() {
        int cNodeSize = classNodeList.size();
        int rNodeSize = relationNodeList.size();
        int vNodeSize = valueNodeList.size();

        for(int i=0;i<classNodeList.size();i++) {
            ClassNode cNode = classNodeList.get(i);
            cNode.setLoc(i);
        }
        for(int i=0;i<relationNodeList.size();i++) {
            RelationNode rNode =relationNodeList.get(i);
            rNode.setLoc(i);
        }
        for(int i=0;i<valueNodeList.size();i++) {
            ValueNode vNode = valueNodeList.get(i);
            vNode.setLoc(i);
        }
    }
}
