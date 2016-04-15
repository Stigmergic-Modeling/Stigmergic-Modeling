/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.util.wordsim;

import net.stigmod.domain.conceptualmodel.ValueNode;

import java.util.*;

/**
 * @author Kai Fu
 * @version 2016/3/23
 */
public class WordSimilarities {
    public static List<List<Double>> vNodeSimList = new ArrayList<>();
    public static List<Integer> unionSetIndex = new ArrayList<>();//用来指示当前vNode是第几个并查集合
    public static Map<Integer,Set<Integer>> unionSetMap = new HashMap<>();//对应unionSetIndex所指的,是对应并查集合

    private static Map<String,Map<String,Double>> vNodeSimMap = new HashMap<>();
    private static List<Integer> fatherUnionList = new ArrayList<>();

    public static void initvNodeSimList(List<ValueNode> valueNodeList) {
        vNodeSimMap.clear();
        fatherUnionList.clear();//一些初始化清空

        if(valueNodeList.size()==0) return;
        else {
            String name = valueNodeList.get(0).getName();
            if(name.length()>0&&isChinese(name.charAt(0))) {//说明是中文
                WordSimilaritiesForCh.initDict();
                WordSimilaritiesForCh.getVNodeSimListByName(valueNodeList);
                vNodeSimList = WordSimilaritiesForCh.vNodeSimList;
            }else {
                WordSimilaritiesForEn.initWuAndPalmer_PathLength();
                WordSimilaritiesForEn.vNodeSimList.clear();//先清空一下
                WordSimilaritiesForEn.getVNodeSimListByName(valueNodeList);//必须先setLocForList在进行该函数
                vNodeSimList = WordSimilaritiesForEn.vNodeSimList;
            }
        }
        initvNodeSimMap(valueNodeList);//再初始化一个map
        getUnionSet(valueNodeList);
    }

    private static void initvNodeSimMap(List<ValueNode> valueNodeList) {
        int vSize = valueNodeList.size();
        if(vSize==0) return;
        for(int i=0;i<vSize;i++) {
            ValueNode curVNode = valueNodeList.get(i);
            String curVName = curVNode.getName();
            Map<String,Double> innerSimMap = new HashMap<>();
            for(int j=0;j<vSize;j++) {
                ValueNode otherVNode = valueNodeList.get(j);
                String otherVName = otherVNode.getName();
                innerSimMap.put(otherVName,vNodeSimList.get(i).get(j));
            }
            if(!innerSimMap.containsKey("") && curVName.equals("")) innerSimMap.put("",1.0);
            else if(!innerSimMap.containsKey("")) innerSimMap.put("",0.0);
            vNodeSimMap.put(curVName,innerSimMap);
        }
        if(!vNodeSimMap.containsKey("")) {//这个还有用
            Map<String,Double> noInnerMap = new HashMap<>();
            noInnerMap.put("",1.0);
            for(int i=0;i<vSize;i++) {
                ValueNode curVNode = valueNodeList.get(i);
                String curVName = curVNode.getName();
                noInnerMap.put(curVName,0.0);
            }
            vNodeSimMap.put("",noInnerMap);//对于这种空的情况我们也要考虑的
        }
    }

    private static void getUnionSet(List<ValueNode> valueNodeList) {
        int vSize = valueNodeList.size();
        unionSetInit(valueNodeList,vSize);//初始化并查集
        List<String> vNameList = new ArrayList<>();
        for(int i=0;i<vSize;i++) {
            ValueNode vNode = valueNodeList.get(i);
            vNameList.add(vNode.getName());
        }
        //获得了所有valueNode的name集合
        for(int i=0;i<vSize;i++) {
            String outerName = vNameList.get(i);
            if(isSpecialType(outerName)) continue;//为基础类型则返回
            for(int j=i+1;j<vSize;j++) {
                String innerName = vNameList.get(j);
                if(isSpecialType(innerName)) continue;
                if(unionSetIsSame(i,j)) continue;//他们已经是一个集合的了
                if(Double.compare(vNodeSimMap.get(outerName).get(innerName),0.3)>=0) {
                    unionSetUnion(i,j);//将i与j进行union
                }
            }
        }
        //这样我们就得到了整个的并查集
        Set<Integer> alreadySet = new HashSet<>();
        for(int i=0;i<vSize;i++) {
            if(alreadySet.contains(i)) continue;
            else alreadySet.add(i);
            Set<Integer> myUnionSet = new HashSet<>();
            myUnionSet.add(i);
            for(int j=i+1;j<vSize;j++) {
                if(unionSetIsSame(i,j)) {
                    myUnionSet.add(j);
                    alreadySet.add(j);
                    unionSetIndex.set(j,i);
                }
            }
            unionSetMap.put(i,myUnionSet);
        }
    }

    /**
     * 下面这四个函数用于构建valueNode的并查集,即相似度大于0.5的节点是一个集合的
     * @param valueNodeList
     */
    private static void unionSetInit(List<ValueNode> valueNodeList , int vSize) {
        for(int i=0; i<vSize; i++) {
            fatherUnionList.add(i);
            unionSetIndex.add(i);//这是其实不应该放在这,但是还是放这了
        }
    }
    // 合并两个元素所在的集合
    private static void unionSetUnion(int x, int y) {
        x = unionSetGetFather(x);
        y = unionSetGetFather(y);
        if(x!= y) fatherUnionList.set(x,y);
    }
    // 判断两个元素是否属于同一个集合
    private static boolean unionSetIsSame(int x, int y) {
        return unionSetGetFather(x)== unionSetGetFather(y);
    }
    // 获取根结点
    private static int unionSetGetFather(int x) {
        while(x != fatherUnionList.get(x))
            x = fatherUnionList.get(x);
        return x;
    }

    /**
     * 判断是否是中文
     * @param c
     * @return
     */
    private static boolean isChinese(char c) {
        Character.UnicodeBlock ub = Character.UnicodeBlock.of(c);
        if (ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS || ub == Character.UnicodeBlock.CJK_COMPATIBILITY_IDEOGRAPHS
                || ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_A || ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_B
                || ub == Character.UnicodeBlock.CJK_SYMBOLS_AND_PUNCTUATION || ub == Character.UnicodeBlock.HALFWIDTH_AND_FULLWIDTH_FORMS
                || ub == Character.UnicodeBlock.GENERAL_PUNCTUATION) {
            return true;
        }
        return false;
    }

    private static boolean isSpecialType(String name) {
//        if(name.equals("string")||name.equals("float")||name.equals("int")||name.equals("boolean")) return true;
        if(name.equals("1..*")||name.equals("*")||name.equals("1")||name.equals("0..1")||name.equals("0..2")) return true;
        else if(name.equals("true")) return true;
        else return false;
    }
}
