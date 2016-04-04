/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service.migrateService;

import net.stigmod.domain.conceptualmodel.*;
import net.stigmod.util.wordsim.WordSimilarities;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * @target 该类主要用来计算熵值:包括节点和ccm熵值
 *
 * @version     2015/11/11
 * @author 	    Kai Fu
 */
@Service
public class EntropyHandlerImpl implements EntropyHandler{

//    @Autowired
//    private ClassNodeRepository classNodeRepository;
//
//    @Autowired
//    private RelationNodeRepository relationNodeRepository;
//
//    @Autowired
//    private ValueNodeRepository valueNodeRepository;

    private double rtcWeight = 0.8;
    private double roleWeight = 1.0;
    private double nameWeight = 1.0;
    private double multiWeight = 0.3;
    private double otherAttrWeight = 0.1;


    /**
     * @target 主要是获取ClassNode节点的边的Map
     * @param ctvEdges :出边
     * @param rtcEdges :入边
     * @return map数据结构
     */
    public Map<String,List<Set<Long>>> getMapForClassNode(Set<ClassToValueEdge> ctvEdges,Set<RelationToClassEdge> rtcEdges) {
        Map<String,List<Set<Long>>> myMap=new HashMap<>();
        if((ctvEdges==null || ctvEdges.size()==0) && (rtcEdges==null || rtcEdges.size()==0)) return myMap;
        addCTVElementToMap(myMap,ctvEdges);
        addRTCElementToMap(myMap,rtcEdges);
        return myMap;
    }


    /**
     * @target 主要是获取RelationNode节点的边的Map
     * @param rtcEdges :出边
     * @param rtvEdges :出边
     * @return map数据结构
     */
    public Map<String,List<Set<Long>>> getMapForRelationNode(Set<RelationToClassEdge> rtcEdges,Set<RelationToValueEdge> rtvEdges) {
        Map<String,List<Set<Long>>> myMap=new HashMap<>();
        if((rtcEdges==null||rtcEdges.size()==0)&&(rtvEdges==null||rtvEdges.size()==0)) return myMap;
        addRTCElementToMap(myMap,rtcEdges);
        addRTVElementToMap(myMap,rtvEdges);
        return myMap;
    }


    /**
     * @target 主要是获取ValueNode节点的边的Map
     * @param ctvEdges :入边
     * @param rtvEdges :入边
     * @return map数据结构
     */
    public Map<String,List<Set<Long>>> getMapForValueNode(Set<ClassToValueEdge> ctvEdges,Set<RelationToValueEdge> rtvEdges) {
        Map<String,List<Set<Long>>> myMap=new HashMap<>();
        if((ctvEdges==null||ctvEdges.size()==0)&&(rtvEdges==null||rtvEdges.size()==0)) return myMap;
        addCTVElementToMap(myMap,ctvEdges);
        addRTVElementToMap(myMap,rtvEdges);
        return myMap;
    }

    /**
     * @target: 计算出一个节点的熵值(classNode,relationNode,valueNode进行计算时均需调用此函数)
     * @param myMap:以某个节点的边名为key,value是对应边的用户集合
     * @return 熵值
     */
    public Double computeMapEntropy(Map<String, List<Set<Long>>> myMap , Vertex vertex , int nodeSum) {
        double entropy = 0.0;
        entropy = computeMapBiEntropy(myMap,vertex);
        entropy *= nodeSum;
        return entropy;
    }

    /**
     * 对于任何一个要计算熵值的节点而言,都要去判断是否是可能包含相似度的情况
     * @param myMap
     * @param vertex
     * @return
     */
    public Double computeMapBiEntropy(Map<String, List<Set<Long>>> myMap , Vertex vertex) {
        double entropy = 0.0;

        if(myMap.containsKey("name") && vertex.getClass()==ClassNode.class) {
            double tmpEntropy = computeCNodeMapBiEntropyWithSimilarity(((ClassNode) vertex).getCtvEdges());
            entropy += tmpEntropy * nameWeight;//添加权重
            myMap.remove("name");
        }else if(myMap.containsKey("role") && vertex.getClass()==RelationNode.class) {
            List<Set<Long>> roleList = myMap.get("role");
            Map<Integer,List<Set<Long>>> rtvMap = convertRoleListToRVMap((RelationNode)vertex);
            double tmpEntropy = computeRNodeMapBiEntropyWithSimilarity(rtvMap);
            entropy += tmpEntropy * roleWeight;
            myMap.remove("role");
        }
        entropy += computeMapBiEntropyForNoramlNode(myMap);//至于其他的随机变量,则在该函数内部处理
        return entropy;
    }

    private Double computeMapBiEntropyForNoramlNode(Map<String,List<Set<Long>>> myMap) {
        double entropy=0.0;
        for(String key : myMap.keySet()) {//这里的每一个key是种类型的边(比如name)
            List<Set<Long>> valuelist=myMap.get(key);
            int valueListSize = valuelist.size();
            Set<Long> userSet=new HashSet<Long>();//所有用户的集合
            for(int i=0;i<valueListSize;i++) {
                userSet.addAll(valuelist.get(i));
            }
            if(userSet.size()==0) continue;
            Iterator<Long> uIter=userSet.iterator();
            Map<String,List<Long>> resMap=new HashMap<>();
            Map<String,List<Integer>> resEdgeMap = new HashMap<>();//这个value值是边集合
            while(uIter.hasNext()) {
                Long uid=uIter.next();
                StringBuffer stringBuffer=new StringBuffer();
                List<Integer> edgeList = new ArrayList<>();
                for(int i=0;i<valueListSize;i++) {
                    if(valuelist.get(i).contains(uid)) {
                        stringBuffer.append("-"+i+"-");
                        edgeList.add(i);
                    }
                }
                String str_edge=stringBuffer.toString();//边分布名
                if(resMap.containsKey(str_edge)) {
                    resMap.get(str_edge).add(uid);
                }else {
                    List<Long> ulist=new ArrayList<>();
                    ulist.add(uid);
                    resMap.put(str_edge,ulist);
                    resEdgeMap.put(str_edge,edgeList);
                }
            }
            //resMap中包含有边的分布
            int u_num=userSet.size();
            double tagE=0.0;
            List<List<Long>> ulists=new ArrayList<>();
            List<List<Integer>> edgeIdLists=new ArrayList<>();
            for(String str : resMap.keySet()) {
                List<Long> ulist=resMap.get(str);
                if(ulist.size()==0) continue;
                edgeIdLists.add(resEdgeMap.get(str));
                ulists.add(ulist);
            }

            int edgeIdListSize = edgeIdLists.size();
            List<List<Double>> simList=new ArrayList<>();
            for(int i=0;i<edgeIdListSize;i++) {
                List<Integer> cur=edgeIdLists.get(i);
                List<Double> sims=new ArrayList<>();
                simList.add(sims);
                for(int j=0;j<edgeIdListSize;j++) {
                    if(i>=j) {
                        simList.get(i).add(0.0);
                        continue;
                    }
                    List<Integer> other =edgeIdLists.get(j);
                    Set<Integer> con = new HashSet<>(cur);
                    con.retainAll(new HashSet<>(other));
                    Set<Integer> union = new HashSet<>(cur);
                    union.addAll(new HashSet<>(other));
                    double similarity=(double)con.size()/union.size();
                    simList.get(i).add(similarity);
                }
            }

            List<Double> prob=new ArrayList<>();
            int ulistsSize = ulists.size();
            for(int i=0;i<ulistsSize;i++) {
                int tmpListSize = ulists.get(i).size();
                double p=(double) tmpListSize / u_num;
                prob.add(p);
            }

            for(int i=0;i<ulistsSize;i++) {
                double sum=prob.get(i);
                for(int j=0;j<ulistsSize;j++) {
                    if(i==j) continue;
                    if(j>i) sum+=prob.get(j)*simList.get(i).get(j);
                    else sum+=prob.get(j)*simList.get(j).get(i);
                }
                double logp=Math.log(sum)/Math.log(2);
                tagE+=prob.get(i)*logp;
            }
            tagE=-tagE;
            tagE=tagE*userSet.size();

            //添加权重的影响
            if(key.equals("class")) tagE = tagE * rtcWeight;
            else if(key.equals("multi")) tagE = tagE * multiWeight;
            else if(key.equals("role")) tagE = tagE * roleWeight;
            else if(key.equals("name")) tagE = tagE * nameWeight;
            else tagE = tagE * otherAttrWeight;
            entropy+=tagE;
        }
        return entropy;
    }

    private Double computeCNodeMapBiEntropyWithSimilarity(Set<ClassToValueEdge> ctvEdges) {
        //edges有可能是ctv,也有可能是rtv类型的,当前指的是ctv的
        List<ClassToValueEdge> ctvEdgeList = new ArrayList<>(ctvEdges);
        List<Integer> vNodeLocList = new ArrayList<>();
        List<Double> probList = new ArrayList<>();
        int edgeNum = ctvEdgeList.size();
        int uSum = 0;

        int realNum = 0;//替代edgeName的,因为含有0边
        for(int i=0; i<edgeNum; i++) {
            ClassToValueEdge ctvEdge = ctvEdgeList.get(i);
            int curEdgeSize = ctvEdge.getIcmSet().size();
            if(curEdgeSize == 0) continue;
            realNum++;
            vNodeLocList.add(ctvEdge.getEnder().getLoc());
            uSum += curEdgeSize;
            probList.add((double)curEdgeSize);//这里面存储的是整数,因此在待会算概率的时候要除以uSum
        }

        double tagE = computeCNodeBiEntropyWithSimilarityDetail(vNodeLocList, probList, uSum, realNum);
        return tagE;
    }

    /**
     * 这个rtv其实只有一个key,就是role
     * @param rtvMap
     * @return
     */
    private Double computeRNodeMapBiEntropyWithSimilarity(Map<Integer,List<Set<Long>>> rtvMap) {//对于relation节点,这里面的rtv仅限于name为role的情况,rtv的每一种可能两个端口
        double biEntropy = 0.0;
        //这里面的Key是value节点的loc,value是对应的边的用户数
        Set<Long> uSet = new HashSet<>();
        List<Set<Long>> uList = new ArrayList<>();
        List<Integer> uLocList = new ArrayList<>();//这个和ulist对应的.
        for(Integer curLoc : rtvMap.keySet()) {
            List<Set<Long>> curList = rtvMap.get(curLoc);//获取到这个节点的用户集合
            int listSize = curList.size();
            for(int i=0;i<listSize;i++) {
                uSet.addAll(new HashSet<Long>(curList.get(i)));
                if(curList.get(i).size()!=0) {//如果这个集合不为0
                    uList.add(new HashSet<Long>(curList.get(i)));
                    uLocList.add(curLoc);
                }
            }
        }

        int uListNum = uList.size();
        //uSet中获取了所有用户的集合
        int uSum = uSet.size();//所有的用户数
        Iterator<Long> iter = uSet.iterator();
        Map<String,Set<Long>> icmMap = new HashMap<>();
        Map<String,List<Integer>> locMap = new HashMap<>();//对应loc的map,与icmMap一一对应
        while(iter.hasNext()) {
            Long curIcm = iter.next();
            StringBuffer bf = new StringBuffer();
            for(int i=0;i<uListNum;i++) {
                if(i!=uListNum-1&&uList.get(i).contains(curIcm)) bf.append(uLocList.get(i)+"-");
                else if(i==uListNum-1&&uList.get(i).contains(curIcm)) bf.append(uLocList.get(i));
            }

            String bfStr = bf.toString();
            if(icmMap.containsKey(bfStr)) {
                icmMap.get(bfStr).add(curIcm);
            }else {
                Set<Long> cSet = new HashSet<>();
                cSet.add(curIcm);
                icmMap.put(bfStr,cSet);
            }
        }
        //获得了所有用户的针对节点的分布,这个很重要
        for(String str : icmMap.keySet()) {
            List<Integer> locList = new ArrayList<>();
            String[] sts = str.split("-");
            for(int i=0;i<sts.length;i++) {
                if(!sts[i].equals("")) locList.add(Integer.parseInt(sts[i]));//将对应loc加入到locList中去
            }
            locMap.put(str,locList);
        }//获取到所有loc对节点的分布

        int distributeNum = icmMap.keySet().size();//分布数
        List<String> distributeStrList = new ArrayList<>(icmMap.keySet());
        List<Double> probList = new ArrayList<>();//每个分布的概率
        for(int i=0;i<distributeNum;i++) {
            String curStr = distributeStrList.get(i);
            Set<Long> curIcmSet = icmMap.get(curStr);
            double curP = (double)curIcmSet.size()/uSum;
            probList.add(curP);//表示这个分布的概率
        }

        List<List<Double>> simList = new ArrayList<>();
        for(int i=0;i<distributeNum;i++) {
            List<Double> innerSimList = new ArrayList<>();
            for(int j=0;j<distributeNum;j++) {
                if(i>j) innerSimList.add(0.0);
                else if(i==j) innerSimList.add(1.0);
                else {
                    double realSim = computeWordSimWithList(locMap.get(distributeStrList.get(i)),
                            locMap.get(distributeStrList.get(j)));
                    innerSimList.add(realSim);
                }
            }
            simList.add(innerSimList);
        }//得出了相似度矩阵

        double tmpBiEntropy = 0.0;
        for(int i=0;i<distributeNum;i++) {
            double firstP = probList.get(i);
            double sumP = firstP;
            //公式为log(pi+pj*Sim)
            for(int j=0;j<distributeNum;j++) {
                if(i==j) continue;
                double secP = probList.get(j);
                if(i<j) sumP += secP * simList.get(i).get(j);
                else sumP += secP * simList.get(j).get(i);
            }
            double logp = Math.log(sumP)/Math.log(2);
            tmpBiEntropy += firstP * logp;
        }
        biEntropy = -tmpBiEntropy;
        return biEntropy;
    }

    private Double computeCNodeBiEntropyWithSimilarityDetail(List<Integer> vNodeLocList, List<Double> probList, int uSum, int realNum) {
        double tagE = 0.0;
        for(int i=0; i<realNum; i++) probList.set(i,probList.get(i)/uSum);//由于这里的probList不是真正的概率,还要除以总数

        for(int i=0; i<realNum; i++) {
            double curP = probList.get(i);//这是p(xi)
            double sum = curP;
            for(int j=0; j<realNum; j++) {
                if(i==j) continue;
                sum += probList.get(j)* WordSimilarities.vNodeSimList.get(vNodeLocList.get(i)).get(vNodeLocList.get(j));//节点i与节点j的相似度
            }
            double logp = Math.log(sum)/Math.log(2);
            tagE += curP*logp;
        }
        tagE = -tagE;
        tagE = tagE * uSum;
        return tagE;
    }

    private Map<Integer,List<Set<Long>>> convertRoleListToRVMap(RelationNode relationNode) {
        Map<Integer,List<Set<Long>>> rtvMap = new HashMap<>();
        for(RelationToValueEdge rtvEdge : relationNode.getRtvEdges()) {
            if(!rtvEdge.getName().equals("role") || rtvEdge.getIcmSet().size()==0) continue;
            int valueNodeLoc = rtvEdge.getEnder().getLoc();
            if(rtvMap.containsKey(valueNodeLoc)) {
                rtvMap.get(valueNodeLoc).add(new HashSet<Long>(rtvEdge.getIcmSet()));
            }else {
                List<Set<Long>> list = new ArrayList<>();
                list.add(new HashSet<Long>(rtvEdge.getIcmSet()));
                rtvMap.put(valueNodeLoc,list);
            }
        }
        return rtvMap;
    }

    /**
     * 这是为了记录在模拟迁移过程中classnode由于模拟迁移产生的熵值一致问题
     * 在计算模拟迁移的节点相似度的时候,也必需要记住添加权重
     * @param myMap
     * @param ctvNodeMap
     * @param classNode
     * @param nodeSum
     * @return
     */
    public Double computeSimulateMigrateCNodeMapEntropy(Map<String, List<Set<Long>>> myMap , Map<Integer, Set<Long>> ctvNodeMap
            , ClassNode classNode , int nodeSum) {//这个函数主要是处理模拟迁移的的目标节点的熵值计算
        double entropy = 0.0;
        double biEntropy = 0.0;
        biEntropy += computeMapBiEntropy(myMap, classNode);//由于这种迁移是map中不包含name边,所以不用担心冲突

        List<Integer> vNodeLocList = new ArrayList<>();
        List<Double> probList = new ArrayList<>();
        int realNum = 0;
        int uSum = 0;
        for(int loc : ctvNodeMap.keySet()) {
            int curSize = ctvNodeMap.get(loc).size();
            if(curSize==0) continue;
            realNum++;
            uSum+=curSize;
            vNodeLocList.add(loc);
            probList.add((double) curSize);
        }

        double tagE = computeCNodeBiEntropyWithSimilarityDetail(vNodeLocList, probList, uSum, realNum);
        tagE = tagE * nameWeight;//由于computeCNodeBiEntropyWithSimilarityDetail函数并没有包含权重,因此这里需要
        biEntropy += tagE;
        entropy = biEntropy * nodeSum;
        return entropy;
    }

    public Double computeSimulateMigrateRNodeMapEntropy(Map<String, List<Set<Long>>> myMap , Map<Integer, List<Set<Long>>> rtvNodeMap
            , RelationNode relationNode , int nodeSum) {//这个函数主要是处理模拟迁移的的目标节点的熵值计算
        //mymap中包含了除role之外的其他的Map
        double entropy = 0.0;
        double biEntropy = 0.0;
        biEntropy += computeMapBiEntropy(myMap, relationNode);//由于这种迁移是map中不包含role边,所以不用担心冲突

        double tagE = computeRNodeMapBiEntropyWithSimilarity(rtvNodeMap);
        tagE = tagE * roleWeight;
        biEntropy += tagE;
        entropy = biEntropy * nodeSum;
        return entropy;
    }



    public void addRTVElementToMap(Map<String,List<Set<Long>>> myMap , Set<RelationToValueEdge> rtvEdges) {
        //存在两个节点间连着两种边的情况
        Map<String,Set<Long>> tmpMap = new HashMap<>();//key为loc的string,value为用户集合
        Map<String,String> tmpToName = new HashMap<>();//key为loc的string,value为对应边名
        for(RelationToValueEdge rtvEdge:rtvEdges) {
            RelationNode rNode = rtvEdge.getStarter();
            ValueNode vNode = rtvEdge.getEnder();
            String edgeName = rtvEdge.getName();

            String tag = Integer.toString(rNode.getLoc())+"-"+vNode.getLoc()+edgeName;//每次必须要是相同边名的tag才能聚到一起
            if(tmpMap.containsKey(tag)) {
                tmpMap.get(tag).addAll(new HashSet<Long>(rtvEdge.getIcmSet()));
            }else {
                Set<Long> lset=new HashSet<>();
                lset.addAll(new HashSet<Long>(rtvEdge.getIcmSet()));
                tmpMap.put(tag,lset);
                tmpToName.put(tag,edgeName);
            }
        }

        for(String key : tmpMap.keySet()) {
            Set<Long> uSet = tmpMap.get(key);
            String edgeName = tmpToName.get(key);

            if(myMap.containsKey(edgeName)) {
                myMap.get(edgeName).add(uSet);
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(uSet);
                myMap.put(edgeName,list);
            }
        }
    }

    public void addCTVElementToMap(Map<String,List<Set<Long>>> myMap , Set<ClassToValueEdge> ctvEdges) {
        for(ClassToValueEdge ctvEdge:ctvEdges) {
            String edgeName=ctvEdge.getName();
            if(myMap.containsKey(edgeName)) {
                myMap.get(edgeName).add(ctvEdge.getIcmSet());
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(ctvEdge.getIcmSet());
                myMap.put(edgeName ,list);
            }
        }
    }

    public void addRTCElementToMap(Map<String,List<Set<Long>>> myMap , Set<RelationToClassEdge> rtcEdges) {
        //存在两个节点间连着两种边的情况
        Map<String,Set<Long>> tmpMap = new HashMap<>();
        for(RelationToClassEdge rtcEdge : rtcEdges) {
            RelationNode rNode = rtcEdge.getStarter();
            ClassNode cNode = rtcEdge.getEnder();
            String edgeName = rtcEdge.getName();//为了保持一致性,还是做了下区分

            String tag = Integer.toString(rNode.getLoc())+"-"+cNode.getLoc()+edgeName;
            if(tmpMap.containsKey(tag)) {
                tmpMap.get(tag).addAll(new HashSet<Long>(rtcEdge.getIcmSet()));
            }else {
                Set<Long> lset=new HashSet<>();
                lset.addAll(new HashSet<Long>(rtcEdge.getIcmSet()));
                tmpMap.put(tag,lset);
            }
        }
        //我们得到的这个map完全是以relationToclass为核心的,即全部都是class边的
        String edgeName = "class";
        for(String key : tmpMap.keySet()) {
            if(myMap.containsKey(edgeName)) {
                myMap.get(edgeName).add(tmpMap.get(key));
            }else {
                List<Set<Long>> list=new ArrayList<>();
                list.add(tmpMap.get(key));
                myMap.put(edgeName,list);
            }
        }
    }

    //起到初始化node节点的熵值的作用
    public Double initNodeListEntropy(List<ClassNode> classNodeList , List<RelationNode> relationNodeList ,
                                     List<ValueNode> valueNodeList , int nodeSum) {
        double systemEntropy = 0.0;
        double systemBiEntropy = 0.0; //表示没有乘上nodeSum之前的系统熵值

        int csize = classNodeList.size();
        for(int i=0 ; i<csize ; i++) {
            ClassNode classNode = classNodeList.get(i);
            if(classNode.isInitEntropy()) {//如果他是刚被初始化的节点,那么这个节点的熵值必须重新算出,否则不用再计算了
                classNode.setIsInitEntropy(false);//标注这个节点已经被初始化过了,不再是初始节点了
                double cNodeBiEntropy =
                        computeMapBiEntropy(getMapForClassNode(classNode.getCtvEdges(), classNode.getRtcEdges()),classNode);
                if(Double.compare(0.0,cNodeBiEntropy) != 0) {
                    System.out.println("Its a Error for classNode in function initCNodeListEntropy , EntropyHandlerImpl class");
                }
//                classNode.setOrgEntropyValue(cNodeBiEntropy/classNode.getIcmSet().size());
                classNode.setBiEntropyValue(cNodeBiEntropy);//设置节点的熵值
            }else;

            systemBiEntropy += classNode.getBiEntropyValue();
        }

        int rsize = relationNodeList.size();
        for(int i=0 ; i<rsize ; i++) {
            RelationNode relationNode = relationNodeList.get(i);
            if(relationNode.isInitEntropy()) {
                relationNode.setIsInitEntropy(false);
                double rNodeBiEntropy =
                        computeMapBiEntropy(getMapForRelationNode(relationNode.getRtcEdges(), relationNode.getRtvEdges()),relationNode);
                if(Double.compare(0.0,rNodeBiEntropy) != 0) {
                    System.out.println("Its a Error for relationNode in function initRNodeListEntropy , EntropyHandlerImpl class");
                }
//                relationNode.setOrgEntropyValue(rNodeBiEntropy/relationNode.getIcmSet().size());
                relationNode.setBiEntropyValue(rNodeBiEntropy);
            }else;
            systemBiEntropy += relationNode.getBiEntropyValue();
        }

        int vsize = valueNodeList.size();
        for(int i=0;i<vsize;i++) {
            ValueNode valueNode = valueNodeList.get(i);
            if(valueNode.isInitEntropy()) {
                valueNode.setIsInitEntropy(false);
                double vNodeBiEntropy =
                        computeMapBiEntropy(getMapForValueNode(valueNode.getCtvEdges(), valueNode.getRtvEdges()),valueNode);
//                valueNode.setOrgEntropyValue(vNodeBiEntropy/valueNode.getIcmSet().size());
                valueNode.setBiEntropyValue(vNodeBiEntropy);
            }else ;

            systemBiEntropy += valueNode.getBiEntropyValue();
        }

        systemEntropy = systemBiEntropy * nodeSum;
        return systemEntropy;//524233.47265417513
    }

    private double computeWordSimWithList(List<Integer> firstLocSet , List<Integer> secLocSet) {//其实这就是一个二分图
        int firstSize = firstLocSet.size();
        int secSize = secLocSet.size();
        if(firstSize>secSize) return computeWordSimWithListDetail(secLocSet,secSize,firstLocSet,firstSize);
        else return computeWordSimWithListDetail(firstLocSet,firstSize,secLocSet,secSize);
    }

    private double computeWordSimWithListDetail(List<Integer> firstLocSet ,int fSize , List<Integer> secLocSet ,int sSize) {
        //这里面first的size小于或等于secLocSet,其实也就是2个节点对2个节点的相似度计算
        if(fSize>2||sSize>2) {
            System.out.println(">2 , 这是一个错误,理论上不可能出现!!!");
        }
        if(fSize==2&&sSize==2) {
            double sim1 = (WordSimilarities.vNodeSimList.get(firstLocSet.get(0)).get(secLocSet.get(0)) +
                    WordSimilarities.vNodeSimList.get(firstLocSet.get(1)).get(secLocSet.get(1))) / 2;
            double sim2 = (WordSimilarities.vNodeSimList.get(firstLocSet.get(0)).get(secLocSet.get(1)) +
                    WordSimilarities.vNodeSimList.get(firstLocSet.get(1)).get(secLocSet.get(0))) / 2;
            return Math.max(sim1,sim2);
        }else if(fSize==1&&sSize==2) {
            double sim1 = WordSimilarities.vNodeSimList.get(firstLocSet.get(0)).get(secLocSet.get(0));
            double sim2 = WordSimilarities.vNodeSimList.get(firstLocSet.get(0)).get(secLocSet.get(1));
            return Math.max(sim1,sim2);
        }else if(fSize==1&&sSize==1) {
            return WordSimilarities.vNodeSimList.get(firstLocSet.get(0)).get(secLocSet.get(0));
        }
        System.out.println("<1 , 这是一个错误,理论上不可能出现!!!");
        return 0.0;//其实其他情况不可能发生
    }
}
